import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";

// P3-9: the form POSTs to the /api/contact front door instead of calling the
// Convex mutation directly, so the network seam under test is fetch.
const mockFetch = vi.fn();

function okResponse(body: unknown = { ok: true }) {
  return { ok: true, status: 200, json: async () => body };
}

/** Parsed JSON body of the nth fetch call (default: first). */
function sentPayload(n = 0) {
  const [, init] = mockFetch.mock.calls[n] as [string, RequestInit];
  return JSON.parse(init.body as string);
}

describe("ContactForm", () => {
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

  it("renders the name, email, message fields and the Send button", () => {
    render(<ContactForm />);
    expect(
      screen.getByPlaceholderText("your name (optional)"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send/i }),
    ).toBeInTheDocument();
  });

  it("shows a validation error and makes no call for an invalid email", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByPlaceholderText("your email"), "not-an-email");
    await user.type(screen.getByPlaceholderText("your message"), "hello there");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /a valid email, please/i,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows a validation error and makes no call for an empty message", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /a few words, please/i,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("POSTs /api/contact once with trimmed values, default source, and anti-spam fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "  me@example.com  ",
    );
    await user.type(
      screen.getByPlaceholderText("your message"),
      "  a heartfelt note  ",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    await screen.findByText(/inscribed/i);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/contact");

    const payload = sentPayload();
    expect(payload).toMatchObject({
      email: "me@example.com",
      message: "a heartfelt note",
      source: "unknown",
    });
    expect("hp" in payload).toBe(true);
    expect(typeof payload.hp).toBe("string");
    expect(typeof payload.elapsedMs).toBe("number");

    // form is replaced by the confirmation, so the inputs are gone
    expect(screen.queryByPlaceholderText("your email")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("your message"),
    ).not.toBeInTheDocument();
  });

  it("passes a custom source through to /api/contact", async () => {
    const user = userEvent.setup();
    render(<ContactForm source="contact-h8" />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("your message"),
      "hello",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    await screen.findByText(/inscribed/i);
    expect(sentPayload()).toMatchObject({ source: "contact-h8" });
  });

  it("omits name when left blank", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("your message"),
      "hello",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    await screen.findByText(/inscribed/i);
    expect(sentPayload().name).toBeUndefined();
  });

  it("includes the trimmed name when provided", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("your name (optional)"),
      "  Adrianna  ",
    );
    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("your message"),
      "hello",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    await screen.findByText(/inscribed/i);
    expect(sentPayload()).toMatchObject({ name: "Adrianna" });
  });

  it("shows an error when the request rejects", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("your message"),
      "hello there",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

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
    render(<ContactForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("your message"),
      "hello there",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(
      await screen.findByText(/the ink did not take — try again/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/inscribed/i)).not.toBeInTheDocument();
  });

  it("disables the email, message, and Send button while pending", async () => {
    let resolveFetch!: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<ContactForm />);

    const email = screen.getByPlaceholderText("your email");
    const message = screen.getByPlaceholderText("your message");
    const button = screen.getByRole("button", { name: /send/i });

    await user.type(email, "adrianna@example.com");
    await user.type(message, "hello there");
    await user.click(button);

    expect(email).toBeDisabled();
    expect(message).toBeDisabled();
    expect(button).toBeDisabled();

    resolveFetch(okResponse());

    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
  });

  it("caps the name, email, and message fields with maxLength", () => {
    render(<ContactForm />);

    expect(screen.getByPlaceholderText("your name (optional)")).toHaveAttribute(
      "maxLength",
      "100",
    );
    expect(screen.getByPlaceholderText("your email")).toHaveAttribute(
      "maxLength",
      "254",
    );
    expect(screen.getByPlaceholderText("your message")).toHaveAttribute(
      "maxLength",
      "5000",
    );
  });

  it("renders a hidden honeypot field that is not a reachable labeled input", () => {
    const { container } = render(<ContactForm />);

    const honeypot = container.querySelector<HTMLInputElement>(
      'input[name="company"]',
    );
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabIndex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
  });
});
