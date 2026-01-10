import { render, screen } from "@testing-library/react";
import TeamStackedBar from "@/components/statistics/charts/TeamStackedBar";

describe("TeamStackedBar", () => {
  it("should render chart with team member data", () => {
    const data = [
      { name: "John Doe", hours: 40 },
      { name: "Jane Smith", hours: 35 },
      { name: "Bob Johnson", hours: 38 },
    ];

    render(<TeamStackedBar data={data} />);

    expect(screen.getByText("Heures travaillées par membre")).toBeInTheDocument();
  });

  it("should render chart with empty data", () => {
    render(<TeamStackedBar data={[]} />);

    expect(screen.getByText("Heures travaillées par membre")).toBeInTheDocument();
  });

  it("should render with single member", () => {
    const data = [{ name: "John Doe", hours: 40 }];

    render(<TeamStackedBar data={data} />);

    expect(screen.getByText("Heures travaillées par membre")).toBeInTheDocument();
  });

  it("should handle data with target hours", () => {
    const data = [
      { name: "John Doe", hours: 40, target: 40 },
      { name: "Jane Smith", hours: 35, target: 40 },
    ];

    render(<TeamStackedBar data={data} />);

    expect(screen.getByText("Heures travaillées par membre")).toBeInTheDocument();
  });
});
