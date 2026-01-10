import { render, screen } from "@testing-library/react";
import PresenceHeatmap from "@/components/statistics/charts/PresenceHeatmap";

describe("PresenceHeatmap", () => {
  it("should render heatmap with 28 days of data", () => {
    const data = Array.from({ length: 28 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      present: 3,
      total: 5,
    }));

    render(<PresenceHeatmap data={data} />);

    expect(screen.getByText("Présence de l'équipe (4 dernières semaines)")).toBeInTheDocument();
    expect(screen.getByText("S1")).toBeInTheDocument();
    expect(screen.getByText("S2")).toBeInTheDocument();
    expect(screen.getByText("S3")).toBeInTheDocument();
    expect(screen.getByText("S4")).toBeInTheDocument();
  });

  it("should render heatmap with empty data", () => {
    render(<PresenceHeatmap data={[]} />);

    expect(screen.getByText("Présence de l'équipe (4 dernières semaines)")).toBeInTheDocument();
  });

  it("should display legend", () => {
    const data = Array.from({ length: 28 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      present: 2,
      total: 5,
    }));

    render(<PresenceHeatmap data={data} />);

    expect(screen.getByText("Moins")).toBeInTheDocument();
    expect(screen.getByText("Plus")).toBeInTheDocument();
  });

  it("should display day headers", () => {
    const data = Array.from({ length: 28 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      present: 2,
      total: 5,
    }));

    render(<PresenceHeatmap data={data} />);

    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Mar")).toBeInTheDocument();
    expect(screen.getByText("Mer")).toBeInTheDocument();
    expect(screen.getByText("Jeu")).toBeInTheDocument();
    expect(screen.getByText("Ven")).toBeInTheDocument();
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Dim")).toBeInTheDocument();
  });

  it("should handle partial week data", () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      present: 1,
      total: 3,
    }));

    render(<PresenceHeatmap data={data} />);

    expect(screen.getByText("Présence de l'équipe (4 dernières semaines)")).toBeInTheDocument();
  });

  it("should handle 100% presence rate", () => {
    const data = Array.from({ length: 28 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      present: 5,
      total: 5,
    }));

    render(<PresenceHeatmap data={data} />);

    expect(screen.getByText("Présence de l'équipe (4 dernières semaines)")).toBeInTheDocument();
  });

  it("should handle 0% presence rate", () => {
    const data = Array.from({ length: 28 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      present: 0,
      total: 5,
    }));

    render(<PresenceHeatmap data={data} />);

    expect(screen.getByText("Présence de l'équipe (4 dernières semaines)")).toBeInTheDocument();
  });
});
