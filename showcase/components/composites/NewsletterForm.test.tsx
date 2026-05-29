import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterForm } from "./NewsletterForm";

describe("NewsletterForm", () => {
  it("renders the email field and submit button", () => {
    render(<NewsletterForm />);
    expect(screen.getByPlaceholderText("your email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join the vespers/i }),
    ).toBeInTheDocument();
  });

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(screen.getByPlaceholderText("your email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /join the vespers/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /a valid email, please/i,
    );
  });

  it("shows the confirmation message after a valid submit", async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);

    await user.type(
      screen.getByPlaceholderText("your email"),
      "adrianna@example.com",
    );
    await user.click(screen.getByRole("button", { name: /join the vespers/i }));

    expect(await screen.findByText(/inscribed/i)).toBeInTheDocument();
    // form is replaced by the confirmation, so the input is gone
    expect(screen.queryByPlaceholderText("your email")).not.toBeInTheDocument();
  });

  it("respects a custom button label", () => {
    render(<NewsletterForm buttonLabel="Subscribe" />);
    expect(
      screen.getByRole("button", { name: /subscribe/i }),
    ).toBeInTheDocument();
  });
});
