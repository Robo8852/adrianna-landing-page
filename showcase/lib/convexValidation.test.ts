// Unit tests for the shared Convex validation helpers.
//
// Lives in lib/ (not convex/) on purpose: the Convex CLI analyzes every file
// in convex/ on push, and test files would break that analysis.

import { describe, it, expect } from "vitest";
import {
  LIMITS,
  NEWSLETTER_SOURCES,
  CONTACT_SOURCES,
  normalizeSource,
  sanitizeSubjectName,
  redactEmail,
  countUrls,
} from "@/convex/validation";

describe("LIMITS", () => {
  it("defines the agreed field caps", () => {
    expect(LIMITS).toEqual({
      name: 100,
      email: 254,
      message: 5000,
      source: 50,
    });
  });
});

describe("source allowlists", () => {
  it("lists the newsletter sources", () => {
    expect(NEWSLETTER_SOURCES).toEqual(["hero", "h8", "modal", "footer"]);
  });

  it("lists the contact sources", () => {
    expect(CONTACT_SOURCES).toEqual(["contact-h8", "footer"]);
  });
});

describe("normalizeSource", () => {
  it("passes through an allowlisted source", () => {
    expect(normalizeSource("hero", NEWSLETTER_SOURCES)).toBe("hero");
    expect(normalizeSource("contact-h8", CONTACT_SOURCES)).toBe("contact-h8");
  });

  it("collapses non-allowlisted sources to unknown", () => {
    expect(normalizeSource("evil<script>", NEWSLETTER_SOURCES)).toBe("unknown");
    expect(normalizeSource("hero", CONTACT_SOURCES)).toBe("unknown");
  });

  it("collapses undefined and empty strings to unknown", () => {
    expect(normalizeSource(undefined, NEWSLETTER_SOURCES)).toBe("unknown");
    expect(normalizeSource("", NEWSLETTER_SOURCES)).toBe("unknown");
  });
});

describe("sanitizeSubjectName", () => {
  it("strips control characters, including CRLF header-injection vectors", () => {
    expect(sanitizeSubjectName("Eve\r\nBcc: victim@example.com")).toBe(
      "EveBcc: victim@example.com",
    );
    expect(sanitizeSubjectName("a\x00b\x1fc\x7fd")).toBe("abcd");
  });

  it("collapses runs of whitespace and trims the ends", () => {
    expect(sanitizeSubjectName("  Judith   Adrianna\t Naílah  ")).toBe(
      "Judith Adrianna Naílah",
    );
  });

  it("caps the result at 100 characters", () => {
    expect(sanitizeSubjectName("x".repeat(250))).toHaveLength(100);
  });

  it("leaves an ordinary name untouched", () => {
    expect(sanitizeSubjectName("Adrianna")).toBe("Adrianna");
  });
});

describe("redactEmail", () => {
  it("keeps the first character and the domain", () => {
    expect(redactEmail("judith@example.com")).toBe("j***@example.com");
  });

  it("redacts strings that are not email-shaped", () => {
    expect(redactEmail("not-an-email")).toBe("***");
    expect(redactEmail("@example.com")).toBe("***");
    expect(redactEmail("")).toBe("***");
  });
});

describe("countUrls", () => {
  it("returns 0 for plain text", () => {
    expect(countUrls("a heartfelt note with no links")).toBe(0);
  });

  it("counts http, https, and www occurrences case-insensitively", () => {
    expect(
      countUrls(
        "see http://a.com and HTTPS://b.com plus www.c.com and WWW.d.com",
      ),
    ).toBe(4);
  });

  it("counts repeated links individually", () => {
    expect(countUrls("https://spam.com https://spam.com")).toBe(2);
  });
});
