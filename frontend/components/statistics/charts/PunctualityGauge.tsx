"use client";

interface PunctualityGaugeProps {
  percentage: number;
}

export default function PunctualityGauge({ percentage }: PunctualityGaugeProps) {
  // Determine color based on percentage
  const getColor = (value: number) => {
    if (value >= 90) return "text-green-600 dark:text-green-400";
    if (value >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBackgroundColor = (value: number) => {
    if (value >= 90) return "bg-green-100 dark:bg-green-900";
    if (value >= 70) return "bg-yellow-100 dark:bg-yellow-900";
    return "bg-red-100 dark:bg-red-900";
  };

  const getBorderColor = (value: number) => {
    if (value >= 90) return "border-green-200 dark:border-green-700";
    if (value >= 70) return "border-yellow-200 dark:border-yellow-700";
    return "border-red-200 dark:border-red-700";
  };

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Taux de ponctualité
      </h3>

      <div className="flex flex-col items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90" width="200" height="200">
            {/* Background circle */}
            <circle cx="100" cy="100" r="80" stroke="#E5E7EB" strokeWidth="16" fill="none" />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke={percentage >= 90 ? "#10B981" : percentage >= 70 ? "#F59E0B" : "#EF4444"}
              strokeWidth="16"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getColor(percentage)}`}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              d'arrivées à l'heure
            </span>
          </div>
        </div>

        <div
          className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${getBackgroundColor(percentage)} ${getColor(percentage)} border ${getBorderColor(percentage)}`}
        >
          {percentage >= 90 ? "✓ Excellent" : percentage >= 70 ? "⚠ Bien" : "✗ À améliorer"}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Objectif : 95%</p>
      </div>
    </div>
  );
}
