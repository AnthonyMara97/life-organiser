# CSV import — findings from real exports

> Status: **investigation, W9 not started** · 25 November 2026
>
> Evidence from four one-month Westpac exports (personal, joint spendings,
> groceries, rainy-day fund). The files live in `.imports/` (gitignored) and are
> never committed. This page records **structure and counts only** — no balances,
> account numbers or merchant names.

## 1. Two different export formats

| | App export | Internet-banking data export |
|---|---|---|
| Example | `9521298_…csv`, `Groceries.csv` | `Data_export_….csv` |
| Columns | `Date, Description, Debit, Credit, Balance` | `Bank Account, Date, Narrative, Debit Amount, Credit Amount, Balance, Categories, Serial` |
| Date format | `dd Mon yyyy` | `dd/mm/yyyy` |
| Amount model | separate positive Debit and Credit | separate positive Debit Amount and Credit Amount |
| Balance | `$`, with `CR`/`DR` markers on some rows | plain number |
| Row order | oldest first | **newest first** |
| Line endings | LF | CRLF |
| BOM | none | none |
| Unique reference | **none** | `Serial` exists but is **empty in every row** |
| Extras | — | the account itself in `Bank Account`, and Westpac's own category guess |

Parsing consequences:

- Column mapping cannot be hardcoded to one bank. Profiles per format, with the
  mapping UI still the fallback.
- The importer must support **two amount columns**, not just "which column is
  the amount". FIN-8's description needs updating when it is built.
- Row order differs by format. Never assume chronological order; sort by date and
  keep the file's own order only for stable tie-breaking.
- Debit/Credit are trustworthy: once order is accounted for, the balance moves
  exactly by `credit − debit` in **100%** of consecutive rows in all four files.
  The balance column is therefore a free import sanity check.
- `Serial` being empty means there is **no bank-supplied unique id**. The current
  `@@unique([householdId, fingerprint])` on date + amount + description would
  silently drop a legitimate second identical purchase. See §4.

## 2. What the exports contained

| File | Rows | Out / In | Date span |
|---|---|---|---|
| Personal | 68 | 53 / 15 | 25 Oct – 25 Nov |
| Joint spendings | 48 | 35 / 13 | 26 Oct – 23 Nov |
| Groceries | 16 | 5 / 11 | 26 Oct – 5 Nov (partial) |
| Rainy-day fund | 2 | 0 / 2 | 18 – 24 Nov |

Two data issues in the sample set:

- The upload labelled `joint-spendings.csv` was a byte-identical copy of the
  personal export (same MD5). The real joint data is the 8-column data export.
- The windows do not align, so every cross-account matching figure below is a
  floor, not a rate.

## 3. Transfer detection — what the data showed

Heuristic signal by file:

| | Transfer keyword | Rows with an account-like token | Keyword rows with a token |
|---|---|---|---|
| Personal | 2 (`TRANSFER`) | 7 | 2/2 |
| Joint spendings | 10 (`TFR`) | 38 | 10/10 |
| Groceries | 4 | 4 | 4/4 |
| Rainy-day fund | **0** | 0 | — |

Cross-account amount + date matching (opposite sign, equal cents, ≤ 3 days):

- 11 candidates in total: personal→joint 2, joint→personal 2, joint→groceries 2,
  **groceries→personal 5**.
- Two amounts had more than one possible partner.
- Only **1 of 2** personal transfer rows and **1 of 10** joint `TFR` rows found a
  counterpart. The rest point at accounts not uploaded (Cassidy's personal and
  business) or do not line up.
- The groceries→personal direction is implausible for a grocery fund, so several
  of those candidates are false positives. Equal amounts are common; this is why
  amount matching alone cannot confirm a transfer.

Token analysis:

- The joint file carries 34 distinct account-like tokens across 38 rows; **none**
  matches a token in another uploaded file.
- The explanation is structural: each export names the **counterparty**, not
  itself. Two files therefore do not share a token — each holds the other's
  number. Tokens are only usable if the app knows each account's **own** bank
  reference.
- One token is shared between the personal and groceries files, covering all four
  groceries `TRANSFER` rows. What those four outgoing transfers are is still
  unexplained (see §6).

Conclusion: **no single signal is sufficient, and automatic pairing would be
wrong.** Keywords miss silent transfers (all rainy-day credits), tokens need the
account's own reference, and amounts collide. The design must be:

1. Suggest, never confirm.
2. Score candidates on keyword + account reference + equal cents + date window,
   and show the evidence.
3. Allow a manual "these two are a transfer" action for everything the matcher
   misses.
4. Allow one-sided transfers (counterpart pending); exclude only **balanced**
   groups from income/expense so money is never silently hidden.

## 4. Model consequences

- **`Account.bankRef` (proposed, not built).** The account's own BSB/number, or
  just the last 4 digits, entered when the account is created. Narrative tokens
  are compared against *other* accounts' refs. Store the minimum that identifies
  it; never display it.
- **Mask on import.** Replace account-like tokens in the stored description with
  the matched account's name, or a masked form. A raw account number in
  `Transaction.description` would travel into exports and screens.
- **Replace the fingerprint rule.** `Serial` is empty, so dedupe must survive
  legitimate duplicates. Use a multiset difference: for each
  `(account, date, cents, normalised description)` insert only the excess over
  what already exists. That also handles overlapping export windows, which a
  per-file occurrence index does not.
- **Balance check.** Opening balance + imported sum should equal the final
  balance; report a warning when it does not. Handle the two row orders and the
  `CR`/`DR` markers.
- **Transfer category.** A transfer row still needs to satisfy `categoryId`.
  Nullable `categoryId` is the recommendation (`(proposed)` — not yet agreed).
- **Two-tier ledger** (unresolved, W9 blocker): whether unreviewed imported rows
  count in the monthly overview. Unpaired transfer legs make this urgent.

## 5. What was not available

- Cassidy's personal and business exports — the destination of most joint `TFR`
  rows.
- A full-month groceries window.
- Any file with a unique transaction id.

## 6. Open questions for Anthony

1. The groceries export has 11 credits and 4 outgoing `TRANSFER` rows in 11 days,
   all four sharing a token with the personal file. Is that account funded from
   the personal account, and why does money leave it by transfer?
2. Is storing each account's last 4 digits acceptable, or would a hashed full
   reference be preferred?
3. Does Westpac offer **OFX or QIF** downloads? OFX would likely solve two
   problems at once: `FITID` is a unique transaction id, and `TRNTYPE` marks a
   transfer explicitly. This is the first thing to check tomorrow.

## 7. Next: compare export formats before building W9

The plan for the next session is to compare file types against this architecture
before writing any importer code:

| Format | Transfers | Unique id | Parsing risk |
|---|---|---|---|
| CSV (current) | keyword only | none | low |
| **OFX / QBO** | `TRNTYPE=XFER` | `FITID` | low — structured |
| QIF | `[Account]` category conventions | none | low–medium |
| PDF statement | text inference | none | **high** — layout changes, no stable ids |

If OFX is available, it is a materially better source than CSV and the import
design should target it, with CSV as the fallback. PDF is the weakest option and
should only be considered if it is the only thing the bank provides.
