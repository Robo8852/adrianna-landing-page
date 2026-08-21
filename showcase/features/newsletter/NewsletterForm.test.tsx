import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterForm } from "./NewsletterForm";

// P3-9: the form POSTs to the /api/subscribe front door instead of calling
// the Convex mutation directly, so the network seam under test is fetch.
const mockFetch = vi.fn();

function okResponse(body: unknown = { ok: true }) {
  return { ok: true, status: 200, json: async () => body };
}

/** Parsed JSON body of the nth fetch call (default: first). */
function sentPayload(n = 0) {
  const [, init] = mockFetch.mock.calls[n] as [string, RequestInit];
  return JSON.parse(init.body as string);
}

describe("NewsletterForm", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", mockFetch);
    // jsdom cannot run the Cloudflare challenge — make useTurnstile a no-op
    // even if a sitekey leaks in from the developer's environment.
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("renders the email field and submit button", () => {
    render(<NewsletterForm />);
    expect(screen.getByPlaceholderText("your email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /subscribe to our newsletter/i }),
    ).toBeInTheDocument();
  });

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(screen.getByPlaceholderText("your email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /a valid email, please/i,
    );
  });

  it("makes no network call for an invalid email", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(screen.getByPlaceholderText("your email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows the confirmation message after a valid submit", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
    // form is replaced by the confirmation, so the input is gone
    expect(screen.queryByPlaceholderText("your email")).not.toBeInTheDocument();
  });

  it("tells the subscriber a confirmation email is on its way (double opt-in)", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    // The success state must not read as "subscribed" — the address is only
    // pending until the emailed confirmation link is clicked.
    expect(
      await screen.findByText(/letter of confirmation is on its way/i),
    ).toBeInTheDocument();
  });

  it("POSTs /api/subscribe once with the trimmed email and default source", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "  me@example.com  ",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/subscribe");
    expect(sentPayload()).toMatchObject({
      email: "me@example.com",
      source: "unknown",
      hp: "",
    });
  });

  it("passes a custom source through to /api/subscribe", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm source="footer" />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(sentPayload()).toMatchObject({
      email: "me@example.com",
      source: "footer",
      hp: "",
    });
  });

  it("shows an error when the request rejects", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    expect(
      await screen.findByText(/the ink did not take — try again/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/inscribed/i)).not.toBeInTheDocument();
  });

  it("shows an error when the route answers a non-2xx status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ ok: false }),
    });
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    expect(
      await screen.findByText(/the ink did not take — try again/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/inscribed/i)).not.toBeInTheDocument();
  });

  it("disables the input and button while the request is pending", async () => {
    let resolveFetch!: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText("your email");
    const button = screen.getByRole("button", { name: /subscribe to our newsletter/i });

    await user.type(input, "adrianna@example.com");
    await user.click(button);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();

    resolveFetch(okResponse());

    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
  });

  it("treats a filled honeypot as spam: shows confirmation but never POSTs", async () => {
    const user = userEvent.setup();
    const { container } = render(<NewsletterForm />);

    // A bot fills the hidden honeypot field along with the email.
    const honeypot = container.querySelector<HTMLInputElement>(
      'input[name="company"]',
    );
    expect(honeypot).not.toBeNull();
    honeypot!.value = "spambot inc";

    await user.type(
      screen.getByPlaceholderText("your email"),
      "bot@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: /subscribe to our newsletter/i }),
    );

    // Confirmation is shown (no signal to the bot) but nothing is sent.
    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("respects a custom button label", () => {
    render(<NewsletterForm buttonLabel="Subscribe" />);
    expect(
      screen.getByRole("button", { name: /subscribe/i }),
    ).toBeInTheDocument();
  });

  it("sends a numeric timing signal on a valid submit", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(typeof sentPayload().elapsedMs).toBe("number");
  });

  it("sends an honeypot signal on a valid submit", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const payload = sentPayload();
    expect("hp" in payload).toBe(true);
    expect(typeof payload.hp).toBe("string");
  });

  it("renders the honeypot field hidden and non-tab-reachable", () => {
    const { container } = render(<NewsletterForm />);

    const honeypot = container.querySelector<HTMLInputElement>(
      'input[name="company"]',
    );
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabIndex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");

    // it must not be reachable by an accessible-name query (no visible label)
    expect(
      screen.queryByRole("textbox", { name: /company/i }),
    ).not.toBeInTheDocument();
  });

  it("caps the email field with maxLength", () => {
    render(<NewsletterForm />);
    expect(screen.getByPlaceholderText("your email")).toHaveAttribute(
      "maxLength",
      "254",
    );
  });

  it("forwards a hero source through to /api/subscribe", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm source="hero" />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(sentPayload()).toMatchObject({ source: "hero" });
  });
});
