import { render, screen } from "@testing-library/react";
import HoursLineChart from "@/components/statistics/charts/HoursLineChart";

describe("HoursLineChart", () => {
  it("should render chart with data", () => {
    const data = [
      { date: "2026-01-06", hours: 8 },
      { date: "2026-01-07", hours: 7.5 },
      { date: "2026-01-08", hours: 8.5 },
    ];

    render(<HoursLineChart data={data} />);

    expect(screen.getByText("Heures travaillées (30 derniers jours)")).toBeInTheDocument();
  });

  it("should render chart with empty data", () => {
    render(<HoursLineChart data={[]} />);

    expect(screen.getByText("Heures travaillées (30 derniers jours)")).toBeInTheDocument();
  });

  it("should render with single data point", () => {
    const data = [{ date: "2026-01-06", hours: 8 }];

    render(<HoursLineChart data={data} />);

    expect(screen.getByText("Heures travaillées (30 derniers jours)")).toBeInTheDocument();
  });
});
