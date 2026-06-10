import { RateLimiter, MINUTE, HOUR, DAY } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const limiter = new RateLimiter(components.rateLimiter, {
  // subscribe (newsletter)
  subscribeGlobal:   { kind: "token bucket", rate: 25,  period: MINUTE, capacity: 30 },
  subscribeGlobalHr: { kind: "token bucket", rate: 250, period: HOUR,   capacity: 300 },
  subscribePerEmail: { kind: "token bucket", rate: 3,   period: 10 * MINUTE, capacity: 5 },
  subscribeDaily:    { kind: "token bucket", rate: 200, period: DAY,    capacity: 200 },
  // submitContact (contact form) — lower-volume surface, tighter buckets
  contactGlobal:     { kind: "token bucket", rate: 15,  period: MINUTE, capacity: 20 },
  contactGlobalHr:   { kind: "token bucket", rate: 100, period: HOUR,   capacity: 120 },
  contactPerEmail:   { kind: "token bucket", rate: 3,   period: 10 * MINUTE, capacity: 5 },
  contactDaily:      { kind: "token bucket", rate: 50,  period: DAY,    capacity: 50 },
});
