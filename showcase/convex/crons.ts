import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Pending subscribers who never confirm are PII we have no reason to keep —
// sweep expired/abandoned rows once a day, in the quiet hours.
crons.daily(
  "purge expired pending subscribers",
  { hourUTC: 4, minuteUTC: 0 },
  internal.maintenance.purgeExpiredPending,
  {},
);

export default crons;
