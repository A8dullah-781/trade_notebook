import { DateTime } from "luxon";
import { ApiError } from "./ApiError.js";

export function toUtc(typedTime, zone) {
  if (typeof typedTime !== "string" || typeof zone !== "string") {
    throw new ApiError(400, "Time and timezone must be text");
  }

  // Plain local time only. Reject a trailing Z or an offset like +05:00 / -0400.
  if (/(Z|[+-]\d{2}(:?\d{2})?)$/i.test(typedTime.trim())) {
    throw new ApiError(400, "Time must not include Z or an offset");
  }

  const dt = DateTime.fromISO(typedTime.trim(), { zone });

  if (!dt.isValid) {
    throw new ApiError(400, "Invalid time or timezone");
  }

  return dt.toUTC().toJSDate();
}