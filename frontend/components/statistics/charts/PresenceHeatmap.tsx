"use client";

interface PresenceHeatmapProps {
  data: Array<{
    date: string;
    present: number;
    total: number;
  }>;
}

export default function PresenceHeatmap({ data }: PresenceHeatmapProps) {
  // Get last 4 weeks (28 days)
  const weeks: Array<Array<{ date: string; rate: number; day: string }>> = [];
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Group by weeks
  for (let i = 0; i < 4; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const index = i * 7 + j;
      if (index < data.length) {
        const item = data[index];
        const rate = item.total > 0 ? (item.present / item.total) * 100 : 0;
        const date = new Date(item.date);
        week.push({
          date: item.date,
          rate,
          day: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        });
      } else {
        week.push({ date: "", rate: -1, day: "" });
      }
    }
    weeks.push(week);
  }

  const getColor = (rate: number) => {
    if (rate < 0) return "bg-gray-100 dark:bg-gray-800";
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-green-400";
    if (rate >= 50) return "bg-yellow-400";
    if (rate >= 30) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Présence de l'équipe (4 dernières semaines)
      </h3>

      <div className="space-y-2">
        {/* Days header */}
        <div className="flex gap-2 mb-2">
          <div className="w-12"></div>
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className="flex-1 text-center text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-2">
            <div className="w-12 text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center">
              S{4 - weekIdx}
            </div>
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`flex-1 aspect-square rounded ${getColor(day.rate)} transition-colors hover:opacity-80 cursor-pointer relative group`}
                title={
                  day.rate >= 0 ? `${day.day}: ${day.rate.toFixed(0)}% présents` : "Pas de données"
                }
              >
                {day.rate >= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {day.rate.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        <span className="text-gray-600 dark:text-gray-400">Moins</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-red-400"></div>
          <div className="w-4 h-4 rounded bg-orange-400"></div>
          <div className="w-4 h-4 rounded bg-yellow-400"></div>
          <div className="w-4 h-4 rounded bg-green-400"></div>
          <div className="w-4 h-4 rounded bg-green-500"></div>
        </div>
        <span className="text-gray-600 dark:text-gray-400">Plus</span>
      </div>
    </div>
  );
}
