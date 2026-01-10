/**
 * @fileoverview Tests for SidebarItem component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarItem from "@/components/layout/Sidebar/SidebarItem";
import { LayoutDashboard } from "lucide-react";
import { AuthProvider } from "@/lib/contexts/AuthContext";

// Mock Next.js Link
jest.mock("next/link", () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock Next.js Image
jest.mock("next/image", () => {
  return ({ src, alt, width, height, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} {...props} />
  );
});

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/",
  }),
  usePathname: () => "/",
}));

describe("SidebarItem Component", () => {
  const defaultProps = {
    label: "Dashboard",
    icon: LayoutDashboard,
  };

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  /**
   * TEST 1: Basic rendering
   */
  it("should render with label and icon", () => {
    renderWithAuth(<SidebarItem {...defaultProps} />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  /**
   * TEST 2: Wrapper logic (Link vs Button vs Div)
   */
  it("should render as a link when href is provided", () => {
    renderWithAuth(<SidebarItem {...defaultProps} href="/dashboard" />);
    const link = screen.getByRole("link", { name: /dashboard/i });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("should render as a button when onClick is provided without href", () => {
    renderWithAuth(<SidebarItem {...defaultProps} onClick={() => {}} />);
    expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("should render as a div when neither href nor onClick is provided", () => {
    const { container } = renderWithAuth(<SidebarItem {...defaultProps} />);
    // On vérifie que le premier élément HTML est bien un DIV
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  /**
   * TEST 3: Avatar vs Icon logic
   */
  it("should render an avatar when hasAvatar is true", () => {
    renderWithAuth(<SidebarItem {...defaultProps} hasAvatar={true} />);

    // Avatar component devrait être rendu
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it("should render icon when hasAvatar is false", () => {
    renderWithAuth(<SidebarItem {...defaultProps} hasAvatar={false} />);

    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  /**
   * TEST 4: Variant tests (CVA)
   */
  it.each([
    ["important", "bg-green-700"],
    ["secondary", "bg-zinc-100"],
  ])("should apply correct classes for variant %s", (variant, expectedClass) => {
    // On force onClick pour s'assurer que c'est un bouton et faciliter la sélection
    renderWithAuth(<SidebarItem {...defaultProps} variant={variant as any} onClick={() => {}} />);
    const item = screen.getByRole("button");
    expect(item).toHaveClass(expectedClass);
  });

  it("should apply icon size classes when size is 'icon'", () => {
    renderWithAuth(<SidebarItem {...defaultProps} size="icon" onClick={() => {}} />);
    const item = screen.getByRole("button");
    expect(item).toHaveClass("px-3", "py-3");
  });

  it("should apply profile size classes when size is 'profile'", () => {
    renderWithAuth(<SidebarItem {...defaultProps} size="profile" />);
    const item = screen.getByText(/dashboard/i).parentElement;
    expect(item).toHaveClass("w-full", "px-2", "py-2");
  });

  /**
   * TEST 5: Conditional icon logic (Color)
   */
  it("should set icon color to white only when variant is important and NOT active", () => {
    const { rerender } = renderWithAuth(
      <SidebarItem {...defaultProps} variant="important" active={false} />,
    );

    let icon = document.querySelector("svg");
    expect(icon).toHaveAttribute("stroke", "white");

    // If active, it should revert to default color even when variant is important
    rerender(
      <AuthProvider>
        <SidebarItem {...defaultProps} variant="important" active={true} />
      </AuthProvider>,
    );
    icon = document.querySelector("svg");
    expect(icon).toHaveAttribute("stroke", "var(--color-primary)");
  });

  /**
   * TEST 6: Disabled state (Logic & UI)
   */
  it("should handle disabled state for links", () => {
    renderWithAuth(<SidebarItem {...defaultProps} href="/target" variant="disabled" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveClass("pointer-events-none");
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    renderWithAuth(<SidebarItem {...defaultProps} variant="disabled" onClick={handleClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  /**
   * TEST 7: Active state
   */
  it("should apply active styles and disable pointer events", () => {
    renderWithAuth(<SidebarItem {...defaultProps} active onClick={() => {}} />);

    const item = screen.getByRole("button");
    expect(item).toHaveClass("bg-secondary", "pointer-events-none");
  });

  /**
   * TEST 8: Custom className
   */
  it("should merge custom className with tailwind-merge", () => {
    renderWithAuth(<SidebarItem {...defaultProps} className="custom-test-class" />);
    const item = screen.getByText(/dashboard/i).parentElement;
    expect(item).toHaveClass("custom-test-class");
  });
});
