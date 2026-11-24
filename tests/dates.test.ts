import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonthsClamped,
  daysBetween,
  formatDayLabel,
  formatMonthLabel,
  isMonth,
  isoDay,
  monthBounds,
  todayInTimeZone,
} from "../src/lib/dates";

describe("addDays", () => {
  it("moves forward and backward within a month", () => {
    expect(addDays("2026-11-16", 1)).toBe("2026-11-17");
    expect(addDays("2026-11-16", -1)).toBe("2026-11-15");
    expect(addDays("2026-11-16", 0)).toBe("2026-11-16");
  });

  it("crosses month and year boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("knows which Februaries have 29 days", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("lands on the same day across a daylight-saving change", () => {
    // Victoria moves its clocks forward on 4 October 2026. A calendar day is
    // still a calendar day when a clock changes.
    expect(addDays("2026-10-03", 2)).toBe("2026-10-05");
  });

  it("refuses a fraction of a day", () => {
    expect(() => addDays("2026-11-16", 1.5)).toThrow(/whole number/);
  });
});

describe("daysBetween", () => {
  it("counts whole days between two dates", () => {
    expect(daysBetween("2026-11-01", "2026-11-30")).toBe(29);
    expect(daysBetween("2026-11-16", "2026-11-16")).toBe(0);
  });

  it("is negative when the second date is earlier", () => {
    expect(daysBetween("2026-11-30", "2026-11-01")).toBe(-29);
  });

  it("crosses year and leap-day boundaries", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(daysBetween("2027-02-28", "2027-03-01")).toBe(1);
  });

  it("is exact across a daylight-saving change", () => {
    expect(daysBetween("2026-10-03", "2026-10-05")).toBe(2);
  });
});

describe("addMonthsClamped", () => {
  it("clamps 31 January to the end of February", () => {
    expect(addMonthsClamped("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsClamped("2028-01-31", 1)).toBe("2028-02-29");
  });

  it("clamps when moving backwards too", () => {
    expect(addMonthsClamped("2026-03-31", -1)).toBe("2026-02-28");
    expect(addMonthsClamped("2026-05-31", -3)).toBe("2026-02-28");
  });

  it("keeps the day when it exists in the target month", () => {
    expect(addMonthsClamped("2026-11-16", 1)).toBe("2026-12-16");
    expect(addMonthsClamped("2026-11-16", 12)).toBe("2027-11-16");
    expect(addMonthsClamped("2026-11-16", 0)).toBe("2026-11-16");
  });

  it("crosses a year boundary in both directions", () => {
    expect(addMonthsClamped("2026-12-31", 2)).toBe("2027-02-28");
    expect(addMonthsClamped("2027-01-31", -1)).toBe("2026-12-31");
  });
});

describe("invalid input", () => {
  it("rejects formats that are not YYYY-MM-DD", () => {
    expect(() => addDays("16/11/2026", 1)).toThrow(/YYYY-MM-DD/);
    expect(() => addDays("2026-11-16T00:00:00Z", 0)).toThrow(/YYYY-MM-DD/);
  });

  it("rejects days that do not exist", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow(/not a real calendar day/);
    expect(() => daysBetween("2026-13-01", "2026-12-01")).toThrow(
      /not a real calendar day/,
    );
    expect(() => addMonthsClamped("2026-04-31", 1)).toThrow(
      /not a real calendar day/,
    );
  });
});

describe("todayInTimeZone", () => {
  it("uses the Melbourne day, not the UTC day", () => {
    // 2026-11-23 12:59 UTC is 23:59 in Melbourne (AEDT, +11).
    expect(
      todayInTimeZone(
        "Australia/Melbourne",
        new Date("2026-11-23T12:59:00Z"),
      ),
    ).toBe("2026-11-23");
    // 13:00 UTC is midnight, so the household's day has rolled over.
    expect(
      todayInTimeZone(
        "Australia/Melbourne",
        new Date("2026-11-23T13:00:00Z"),
      ),
    ).toBe("2026-11-24");
  });

  it("handles the other side of daylight saving", () => {
    // June is AEST (+10), so midnight is 14:00 UTC.
    expect(
      todayInTimeZone(
        "Australia/Melbourne",
        new Date("2026-06-30T13:59:00Z"),
      ),
    ).toBe("2026-06-30");
    expect(
      todayInTimeZone(
        "Australia/Melbourne",
        new Date("2026-06-30T14:00:00Z"),
      ),
    ).toBe("2026-07-01");
  });
});

describe("isMonth", () => {
  it("accepts a real YYYY-MM", () => {
    expect(isMonth("2026-11")).toBe(true);
    expect(isMonth("2026-01")).toBe(true);
    expect(isMonth("2026-12")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isMonth("2026-13")).toBe(false);
    expect(isMonth("2026-00")).toBe(false);
    expect(isMonth("2026-1")).toBe(false);
    expect(isMonth("2026-11-01")).toBe(false);
    expect(isMonth("November 2026")).toBe(false);
  });
});

describe("monthBounds", () => {
  it("returns the first and last day, inclusive", () => {
    expect(monthBounds("2026-11")).toEqual({
      start: "2026-11-01",
      end: "2026-11-30",
    });
    expect(monthBounds("2026-12")).toEqual({
      start: "2026-12-01",
      end: "2026-12-31",
    });
  });

  it("knows February in common and leap years", () => {
    expect(monthBounds("2026-02")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
    expect(monthBounds("2028-02")).toEqual({
      start: "2028-02-01",
      end: "2028-02-29",
    });
  });

  it("refuses a malformed month", () => {
    expect(() => monthBounds("2026-13")).toThrow(/YYYY-MM/);
  });
});

describe("isoDay", () => {
  it("reads the UTC day from a @db.Date value", () => {
    expect(isoDay(new Date("2026-11-18T00:00:00.000Z"))).toBe("2026-11-18");
    expect(isoDay(new Date("2026-11-18T23:59:59.000Z"))).toBe("2026-11-18");
  });
});

describe("labels", () => {
  it("formats a day without the en-AU comma", () => {
    expect(formatDayLabel("2026-11-18")).toBe("Wed 18 Nov");
  });

  it("formats a month for a heading", () => {
    expect(formatMonthLabel("2026-11")).toBe("November 2026");
  });
});
