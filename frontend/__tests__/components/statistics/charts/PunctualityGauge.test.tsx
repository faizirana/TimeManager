import { render, screen } from "@testing-library/react";
import PunctualityGauge from "@/components/statistics/charts/PunctualityGauge";

describe("PunctualityGauge", () => {
  it("should render excellent status for high punctuality", () => {
    render(<PunctualityGauge percentage={95} />);

    expect(screen.getByText("Taux de ponctualité")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("✓ Excellent")).toBeInTheDocument();
  });

  it("should render good status for medium punctuality", () => {
    render(<PunctualityGauge percentage={75} />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("⚠ Bien")).toBeInTheDocument();
  });

  it("should render needs improvement status for low punctuality", () => {
    render(<PunctualityGauge percentage={50} />);

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("✗ À améliorer")).toBeInTheDocument();
  });

  it("should render with 100% punctuality", () => {
    render(<PunctualityGauge percentage={100} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("✓ Excellent")).toBeInTheDocument();
  });

  it("should render with 0% punctuality", () => {
    render(<PunctualityGauge percentage={0} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("✗ À améliorer")).toBeInTheDocument();
  });

  it("should display target percentage", () => {
    render(<PunctualityGauge percentage={85} />);

    expect(screen.getByText("Objectif : 95%")).toBeInTheDocument();
  });
});
