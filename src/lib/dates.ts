/**
 * Calendar-day helpers.
 *
 * A calendar day has no time and no timezone, so it is represented as an ISO
 * string: "2026-11-16". Storing one as a `Date` invites the classic bug where a
 * transaction on the 1st of the month lands in the previous month, because
 * "midnight" means a different instant in every timezone.
 *
 * Arithmetic happens in UTC, which has no daylight-saving transitions. These
 * functions never return a `Date`: if you need a `Date`, you are dealing with a
 * moment in time, not a calendar day.
 */

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type DayParts = { year: number; month: number; day: number };

/**
 * Turns "2026-11-16" into its three numbers, rejecting impossible days such as
 * 2026-02-30. JavaScript's Date would quietly roll those over into March, which
 * is exactly the kind of silent error we refuse to allow in money data.
 */
function parseDay(value: string): DayParts {
  const match = ISO_DAY.exec(value);
  if (!match) {
    throw new Error(`Expected a YYYY-MM-DD date, received "${value}"`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const asUtc = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    asUtc.getUTCFullYear() === year &&
    asUtc.getUTCMonth() === month - 1 &&
    asUtc.getUTCDate() === day;

  if (!isRealDate) {
    throw new Error(`"${value}" is not a real calendar day`);
  }

  return { year, month, day };
}

/** Turns a UTC millisecond timestamp back into "YYYY-MM-DD". */
function formatDay(utcMs: number): string {
  const date = new Date(utcMs);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysInMonth(year: number, month: number): number {
  // Day 0 of a month is the last day of the month before it.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function assertWholeNumber(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new Error(`Expected a whole number, received ${amount}`);
  }
}

/**
 * Moves a calendar day by a number of days. Negative amounts move backwards.
 * Month and year boundaries, and leap days, are handled by the calendar.
 */
export function addDays(day: string, amount: number): string {
  assertWholeNumber(amount);
  const { year, month, day: date } = parseDay(day);
  return formatDay(Date.UTC(year, month - 1, date) + amount * MS_PER_DAY);
}

/**
 * Whole days from `from` to `to`. Positive when `to` is later, negative when it
 * is earlier, zero for the same day. Because both sides are calendar days at UTC
 * midnight, a daylight-saving change cannot make this 0.96 or 1.04.
 */
export function daysBetween(from: string, to: string): number {
  const start = parseDay(from);
  const end = parseDay(to);
  const startMs = Date.UTC(start.year, start.month - 1, start.day);
  const endMs = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endMs - startMs) / MS_PER_DAY);
}

/**
 * Moves by whole months, clamping to the last day of the target month.
 * 31 January plus one month is 28 February (29 in a leap year), not 3 March.
 * This is the rule bills due on the 31st need, and it is why the function is
 * named "clamped" rather than "addMonths".
 */
export function addMonthsClamped(day: string, amount: number): string {
  assertWholeNumber(amount);
  const { year, month, day: date } = parseDay(day);

  // Count months from year zero so negative amounts stay correct.
  const monthTotal = year * 12 + (month - 1) + amount;
  const targetYear = Math.floor(monthTotal / 12);
  const targetMonth = monthTotal - targetYear * 12; // 0 = January
  const targetDay = Math.min(date, daysInMonth(targetYear, targetMonth + 1));

  return formatDay(Date.UTC(targetYear, targetMonth, targetDay));
}

/**
 * The calendar day in a time zone, as ISO "YYYY-MM-DD".
 *
 * "Today" is not the same day everywhere. The household lives in
 * Australia/Melbourne, so the month a page opens on is decided there, not by
 * the server's UTC clock.
 */
export function todayInTimeZone(
  timeZone = "Australia/Melbourne",
  now: Date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes): string => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new Error(`Could not read "${type}" for ${timeZone}`);
    }
    return part.value;
  };

  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** True for a well-formed "YYYY-MM" month. */
export function isMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** First and last calendar day of a month, inclusive. */
export function monthBounds(month: string): { start: string; end: string } {
  if (!isMonth(month)) {
    throw new Error(`Expected a YYYY-MM month, received "${month}"`);
  }

  const start = `${month}-01`;
  return { start, end: addDays(addMonthsClamped(start, 1), -1) };
}

/**
 * A `@db.Date` column comes back from Prisma as a Date at UTC midnight. Read the
 * UTC day; using local getters would shift the date for anyone east of UTC.
 */
export function isoDay(date: Date): string {
  return formatDay(date.getTime());
}

/** Human day for a table: "Wed 18 Nov". */
export function formatDayLabel(day: string): string {
  const { year, month, day: date } = parseDay(day);
  const parts = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).formatToParts(new Date(Date.UTC(year, month - 1, date)));

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  // en-AU would render "Wed, 18 Nov"; the house style has no comma.
  return `${get("weekday")} ${get("day")} ${get("month")}`.trim();
}

/** Human month for a heading: "November 2026". */
export function formatMonthLabel(month: string): string {
  if (!isMonth(month)) {
    throw new Error(`Expected a YYYY-MM month, received "${month}"`);
  }

  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00.000Z`));
}
