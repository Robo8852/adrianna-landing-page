import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterForm } from "./NewsletterForm";

const { mockSubscribe } = vi.hoisted(() => ({ mockSubscribe: vi.fn() }));

vi.mock("convex/react", () => ({ useMutation: () => mockSubscribe }));
vi.mock("@/convex/_generated/api", () => ({
  api: { subscribers: { subscribe: "subscribe" } },
}));

describe("NewsletterForm", () => {
  beforeEach(() => {
    mockSubscribe.mockReset();
    mockSubscribe.mockResolvedValue({ ok: true });
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
    expect(mockSubscribe).not.toHaveBeenCalled();
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

  it("calls subscribe once with the trimmed email and default source", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "  me@example.com  ",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith({
      email: "me@example.com",
      source: "unknown",
      hp: "",
    });
  });

  it("passes a custom source through to subscribe", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm source="footer" />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "me@example.com",
    );
    await user.click(screen.getByRole("button", { name: /subscribe to our newsletter/i }));

    await screen.findByText(/inscribed/i);
    expect(mockSubscribe).toHaveBeenCalledWith({
      email: "me@example.com",
      source: "footer",
      hp: "",
    });
  });

  it("shows an error when the subscribe call rejects", async () => {
    mockSubscribe.mockRejectedValueOnce(new Error("nope"));
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
    let resolveSubscribe!: (value: unknown) => void;
    mockSubscribe.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubscribe = resolve;
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

    resolveSubscribe({ ok: true });

    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
  });

  it("treats a filled honeypot as spam: shows confirmation but never calls subscribe", async () => {
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
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it("respects a custom button label", () => {
    render(<NewsletterForm buttonLabel="Subscribe" />);
    expect(
      screen.getByRole("button", { name: /subscribe/i }),
    ).toBeInTheDocument();
  });
});
