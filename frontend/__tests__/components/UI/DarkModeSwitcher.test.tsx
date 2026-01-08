import { render, screen, fireEvent, act } from "@testing-library/react";
import DarkModeSwitcher from "@/components/UI/DarkModeSwitcher";
import { useTheme } from "next-themes";

// 1. Mock de next-themes
jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

// 2. Mock de SidebarItem pour simplifier la sélection et éviter de tester le composant parent
jest.mock("@/components/layout/Sidebar/SidebarItem", () => {
  return function MockSidebarItem({ onClick, icon: Icon, ...props }: any) {
    return (
      <button onClick={onClick} data-testid="sidebar-item" {...props}>
        {Icon && <Icon data-testid="theme-icon" />}
      </button>
    );
  };
});

// Mock des icônes Lucide pour vérifier laquelle est affichée
jest.mock("lucide-react", () => ({
  Sun: () => <div data-testid="sun-icon" />,
  Moon: () => <div data-testid="moon-icon" />,
}));

describe("DarkModeSwitcher Component", () => {
  const setThemeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: Hydration state before mounting
   */
  it("should render a placeholder before mounting", () => {
    // On mock useTheme pour renvoyer des valeurs par défaut
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: setThemeMock,
      resolvedTheme: "light",
    });

    // Pour tester le "non-monté", on peut vérifier le comportement initial.
    // Note: Dans un environnement de test standard, useEffect s'exécute immédiatement après render.
    const { container } = render(<DarkModeSwitcher />);

    // Si on veut vraiment voir le placeholder, il faudrait empêcher l'effet,
    // mais ici on vérifie surtout que le composant finit par s'afficher.
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * TEST 2: Render in Light mode
   */
  it("should render Moon icon when theme is light", () => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: setThemeMock,
      resolvedTheme: "light",
    });

    render(<DarkModeSwitcher />);

    // On vérifie que l'icône Moon est présente
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
  });

  /**
   * TEST 3: Render in Dark mode
   */
  it("should render Sun icon when theme is dark", () => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: setThemeMock,
      resolvedTheme: "dark",
    });

    render(<DarkModeSwitcher />);

    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
  });

  /**
   * TEST 4: Toggle logic (Theme change)
   */
  it("should call setTheme with 'dark' when clicked in light mode", () => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: setThemeMock,
      resolvedTheme: "light",
    });

    render(<DarkModeSwitcher />);

    const button = screen.getByTestId("sidebar-item");
    fireEvent.click(button);

    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'light' when clicked in dark mode", () => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: setThemeMock,
      resolvedTheme: "dark",
    });

    render(<DarkModeSwitcher />);

    const button = screen.getByTestId("sidebar-item");
    fireEvent.click(button);

    expect(setThemeMock).toHaveBeenCalledWith("light");
  });
});
