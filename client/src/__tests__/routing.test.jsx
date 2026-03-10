import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import routerConfig from "../router"; // Assuming the router config is exported

describe("Frontend Routing", () => {
  it("renders the Layout navigation on the home page", () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    // Verify navigation links are present
    expect(screen.getByRole("link", { name: /feed/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /write/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();

    // Verify home page placeholder content is rendered
    expect(screen.getByText(/discovery feed placeholder/i)).toBeInTheDocument();
  });

  it("navigates to the Create Log page when clicking 'write'", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    // Click the write link
    const writeLink = screen.getByRole("link", { name: /write/i });
    await user.click(writeLink);

    // Verify URL change visually via rendered content
    expect(
      screen.getByRole('heading', { name: /create a new log/i })
    ).toBeInTheDocument();
  });

  it("renders the NotFoundPage for an unknown route", () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/this-route-does-not-exist"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/404 - Not Found/i)).toBeInTheDocument();
  });
});
