"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TeamStackedBarProps {
  data: Array<{
    name: string;
    hours: number;
    target?: number;
  }>;
}

export default function TeamStackedBar({ data }: TeamStackedBarProps) {
  // Sort by hours descending
  const sortedData = [...data].sort((a, b) => b.hours - a.hours);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Heures travaillées par membre
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis type="number" stroke="#6B7280" style={{ fontSize: "12px" }} />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#6B7280"
            style={{ fontSize: "12px" }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
            labelStyle={{ color: "#F9FAFB" }}
            formatter={(value: number) => [`${value.toFixed(1)}h`, "Heures"]}
          />
          <Legend />
          <Bar dataKey="hours" fill="#10B981" name="Heures travaillées" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
