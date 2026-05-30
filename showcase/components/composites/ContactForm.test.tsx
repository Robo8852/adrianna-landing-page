import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";

const { mockSubmit } = vi.hoisted(() => ({ mockSubmit: vi.fn() }));

vi.mock("convex/react", () => ({ useMutation: () => mockSubmit }));
vi.mock("@/convex/_generated/api", () => ({
  api: { messages: { submitContact: "submitContact" } },
}));

describe("ContactForm", () => {
  beforeEach(() => {
    mockSubmit.mockReset();
    mockSubmit.mockResolvedValue({ ok: true });
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
    expect(mockSubmit).not.toHaveBeenCalled();
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
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("submits once with trimmed values, default source, and anti-spam fields", async () => {
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
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "me@example.com",
        message: "a heartfelt note",
        source: "unknown",
      }),
    );

    const payload = mockSubmit.mock.calls[0][0];
    expect("hp" in payload).toBe(true);
    expect(typeof payload.hp).toBe("string");
    expect(typeof payload.elapsedMs).toBe("number");

    // form is replaced by the confirmation, so the inputs are gone
    expect(screen.queryByPlaceholderText("your email")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("your message"),
    ).not.toBeInTheDocument();
  });

  it("passes a custom source through to submitContact", async () => {
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
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ source: "contact-h8" }),
    );
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
    const payload = mockSubmit.mock.calls[0][0];
    expect(payload.name).toBeUndefined();
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
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Adrianna" }),
    );
  });

  it("shows an error when the submit call rejects", async () => {
    mockSubmit.mockRejectedValueOnce(new Error("nope"));
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
    let resolveSubmit!: (value: unknown) => void;
    mockSubmit.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubmit = resolve;
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

    resolveSubmit({ ok: true });

    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
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
