import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomDatePickerProps {
  label?: string;
  value?: string; // Standard YYYY-MM-DD
  placeholder?: string;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
}

interface CalendarDay {
  day: number;
  month: number; // 0-11
  year: number;
  isCurrentMonth: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper to format date display (DD-MM-YYYY)
const formatDateDisplay = (val?: string) => {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Helper to parse "YYYY-MM-DD" string into Date object
const parseDateString = (val?: string): Date | null => {
  if (!val) return null;
  const parts = val.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
};

// Helper to format Date object into YYYY-MM-DD
const formatDateISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function CustomDatePicker({
  label,
  value = "",
  placeholder = "DD-MM-YYYY",
  onChange,
  required = false,
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Local calendar view states
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Local selection state inside the modal
  const today = new Date();
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(today);

  // Sync component value with local states on open
  useEffect(() => {
    if (isOpen) {
      const parsed = parseDateString(value);
      if (parsed) {
        setTempSelectedDate(parsed);
        setViewMonth(parsed.getMonth());
        setViewYear(parsed.getFullYear());
      } else {
        const today = new Date();
        setTempSelectedDate(today);
        setViewMonth(today.getMonth());
        setViewYear(today.getFullYear());
      }
    }
  }, [isOpen, value]);

  // Handle open/close animation cycle
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Generate Year range (1900 to Current Year + 20)
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 20; y >= 1900; y--) {
    years.push(y);
  }

  // Handle month/year changes
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => Math.max(1900, prev - 1));
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => Math.min(currentYear + 20, prev + 1));
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate days in calendar grid (6 rows of 7 days = 42 cells)
  const generateDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];

    // First day index (Mon = 0, Tue = 1, ..., Sun = 6)
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Previous month info
    let prevMonth = viewMonth - 1;
    let prevYear = viewYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    const prevDaysInMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    // Next month info
    let nextMonth = viewMonth + 1;
    let nextYear = viewYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    // 1. Previous month padded days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevDaysInMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // 2. Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // 3. Next month padded days to fill the 42 cells grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleSelectDay = (item: CalendarDay) => {
    const selected = new Date(item.year, item.month, item.day);
    setTempSelectedDate(selected);
    // If clicking a day from previous/next month, update calendar view too
    if (item.month !== viewMonth || item.year !== viewYear) {
      setViewMonth(item.month);
      setViewYear(item.year);
    }
  };

  const handleConfirm = () => {
    if (onChange) {
      const formatted = tempSelectedDate ? formatDateISO(tempSelectedDate) : "";
      onChange({ target: { value: formatted } });
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setTempSelectedDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const handleClear = () => {
    setTempSelectedDate(null);
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number, month: number, year: number) => {
    if (!tempSelectedDate) return false;
    return (
      day === tempSelectedDate.getDate() &&
      month === tempSelectedDate.getMonth() &&
      year === tempSelectedDate.getFullYear()
    );
  };

  const calendarDays = generateDays();

  return (
    <div className="w-full">
      {label && (
        <label className="flex items-center gap-2 mb-1.5 text-[11px] font-bold text-slate-500 tracking-[0.08em] uppercase">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Styled Input Trigger */}
      <div className="relative">
        <input
          type="text"
          readOnly
          disabled={disabled}
          value={formatDateDisplay(value)}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full px-3.5 py-2.5 pr-10 border-[1.5px] border-gray-300 rounded-[10px] outline-none text-sm text-[#0f172a] bg-white cursor-pointer transition-all duration-200 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 ${
            disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(true)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Center Modal Picker */}
      {isRendered && (
        <div
          className={`fixed inset-0 bg-black/45 flex items-center justify-center z-[9999] p-4 transition-opacity duration-200 ${
            isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`bg-white rounded-2xl border border-emerald-100 shadow-2xl w-full max-w-[360px] overflow-hidden transition-all duration-200 ${
              isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 p-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  {tempSelectedDate
                    ? tempSelectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select Date"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-all"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Month/Year selectors & chevrons */}
              <div className="flex items-center gap-1.5 justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg border border-slate-200 shadow-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 flex-1 justify-center">
                  {/* Month Dropdown */}
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                    className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md py-1 px-1.5 cursor-pointer outline-none focus:border-emerald-500 transition-all"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* Year Dropdown */}
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                    className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md py-1 px-1.5 cursor-pointer outline-none focus:border-emerald-500 transition-all"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg border border-slate-200 shadow-sm transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="p-4">
              {/* Day Headers (Mon-Sun) */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((dayName) => (
                  <div
                    key={dayName}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1"
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, index) => {
                  const todayFlag = isToday(item.day, item.month, item.year);
                  const selectedFlag = isSelected(
                    item.day,
                    item.month,
                    item.year
                  );

                  let cellClass =
                    "w-9 h-9 text-xs flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none ";

                  if (selectedFlag) {
                    cellClass +=
                      "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20";
                  } else if (todayFlag) {
                    cellClass +=
                      "border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-50";
                  } else if (!item.isCurrentMonth) {
                    cellClass += "text-slate-300 hover:bg-slate-50";
                  } else {
                    cellClass += "text-slate-700 hover:bg-slate-100";
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDay(item)}
                      className={cellClass}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Inner Operations Panel */}
              <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors font-medium"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors bg-emerald-50 px-2 py-1 rounded"
                >
                  Select Today
                </button>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold shadow-sm shadow-emerald-500/10"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
