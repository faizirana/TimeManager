/**
 * TimePicker Component
 *
 * Custom time picker with hour and minute dropdowns
 * Styled with primary color theme
 */

"use client";

import { forwardRef, useState, useEffect } from "react";

interface TimePickerProps {
  id?: string;
  value?: string; // Format: "HH:mm"
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  ({ id, value = "", onChange, disabled = false, required = false }, ref) => {
    const [hour, setHour] = useState("09");
    const [minute, setMinute] = useState("00");

    // Parse initial value
    useEffect(() => {
      if (value) {
        const [h, m] = value.split(":");
        if (h) setHour(h.padStart(2, "0"));
        if (m) setMinute(m.padStart(2, "0"));
      }
    }, [value]);

    const handleHourChange = (newHour: string) => {
      setHour(newHour);
      onChange?.(`${newHour}:${minute}`);
    };

    const handleMinuteChange = (newMinute: string) => {
      setMinute(newMinute);
      onChange?.(`${hour}:${newMinute}`);
    };

    // Generate hours (00-23)
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

    // Generate minutes (00-59)
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

    return (
      <div ref={ref} id={id} className="flex items-center gap-2">
        {/* Hour Select */}
        <div className="flex-1">
          <select
            value={hour}
            onChange={(e) => handleHourChange(e.target.value)}
            disabled={disabled}
            required={required}
            className="w-full px-4 py-2 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[var(--foreground)] font-medium">:</span>

        {/* Minute Select */}
        <div className="flex-1">
          <select
            value={minute}
            onChange={(e) => handleMinuteChange(e.target.value)}
            disabled={disabled}
            required={required}
            className="w-full px-4 py-2 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  },
);

TimePicker.displayName = "TimePicker";
