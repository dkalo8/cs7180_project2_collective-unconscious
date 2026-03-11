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
    expect(screen.getByRole("link", { name: /广场/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /新建/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /关于/i })).toBeInTheDocument();

    // Verify home page content is rendering
    expect(screen.getByText(/加载/i)).toBeInTheDocument();
  });

  it("navigates to the Create Log page when clicking 'write'", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    // Click the write link
    const writeLink = screen.getByRole("link", { name: /新建/i });
    await user.click(writeLink);

    // Verify URL change visually via rendered content
    expect(
      screen.getByText(/title/i) || screen.getByRole('heading')
    ).toBeTruthy();
  });

  it("renders the NotFoundPage for an unknown route", () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/this-route-does-not-exist"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/404 - Not Found/i)).toBeInTheDocument();
  });
});
