import { DateTime } from "luxon";
import { ApiError } from "./ApiError.js";

export function getMonthRange(month, zone) {
  // 1. "Now" in the user's zone. Also checks the zone is valid.
  const now = DateTime.now().setZone(zone);
  if (!now.isValid) {
    throw new ApiError(400, "Invalid timezone");
  }

  let year;
  let monthNumber;

  if (month === undefined) {
    // 2. No month sent: use the current month in the user's zone
    year = now.year;
    monthNumber = now.month;
  } else {
    // 3. Month sent: must be a string like 2026-10
    if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new ApiError(400, "Month must look like YYYY-MM, for example 2026-10");
    }
    const parts = month.split("-");
    year = Number(parts[0]);
    monthNumber = Number(parts[1]);
  }

  // 4. First moment of the month in the user's zone, and of the next month
  const start = DateTime.fromObject(
    { year, month: monthNumber, day: 1 },
    { zone },
  );
  const end = start.plus({ months: 1 });

  // 5. Return UTC dates (JS Date) plus the month text
  return {
    month: `${year}-${String(monthNumber).padStart(2, "0")}`,
    start: start.toJSDate(),
    end: end.toJSDate(),
  };
}