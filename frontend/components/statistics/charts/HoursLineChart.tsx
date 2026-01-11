"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HoursLineChartProps {
  data: Array<{
    date: string;
    hours: number;
  }>;
}

export default function HoursLineChart({ data }: HoursLineChartProps) {
  // Format data for display
  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    hours: Number(item.hours.toFixed(1)),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Heures travaillées (30 derniers jours)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: "12px" }}
            label={{ value: "Heures", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
            labelStyle={{ color: "#F9FAFB" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#10B981"
            strokeWidth={2}
            name="Heures"
            dot={{ fill: "#10B981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
