import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface CustomTimePickerProps {
  label?: string;
  value?: string; // Standard HH:MM 24-hour format (e.g., "09:30" or "18:00")
  placeholder?: string;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
  use24HourByDefault?: boolean;
}

// Helper to parse standard HH:MM time
const parseTime24 = (val?: string) => {
  if (!val) {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  }
  const parts = val.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    hour: isNaN(h) ? new Date().getHours() : h,
    minute: isNaN(m) ? new Date().getMinutes() : m,
  };
};

// Helper to convert 24h to 12h format
const convert24To12 = (h: number): { hour12: number; period: "AM" | "PM" } => {
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
};

// Helper to convert 12h to 24h format
const convert12To24 = (h12: number, period: string) => {
  let h24 = h12 % 12;
  if (period === "PM") {
    h24 += 12;
  }
  return h24;
};

const pad = (num: number) => String(num).padStart(2, "0");

export default function CustomTimePicker({
  label,
  value = "",
  placeholder = "Select Time",
  onChange,
  required = false,
  disabled = false,
  use24HourByDefault = false,
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Time States
  const now = new Date();

  const current24Hour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  const currentPeriod = current24Hour >= 12 ? "PM" : "AM";

  const current12Hour =
    current24Hour % 12 === 0 ? 12 : current24Hour % 12;

  const [is24Hour, setIs24Hour] = useState(use24HourByDefault);

  const [tempHour, setTempHour] = useState(
    use24HourByDefault ? current24Hour : current12Hour
  );

  const [tempMinute, setTempMinute] = useState(currentMinute);

  const [tempSecond, setTempSecond] = useState(currentSecond);

  const [tempPeriod, setTempPeriod] = useState<"AM" | "PM">(currentPeriod);
  // Track focused column for keyboard navigation: 'hour' | 'minute' | 'second' | 'period'
  const [focusedSection, setFocusedSection] = useState<"hour" | "minute" | "second" | "period">("hour");

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const secondListRef = useRef<HTMLDivElement>(null);
  const periodListRef = useRef<HTMLDivElement>(null);

  const scrollTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const blockScrollUpdateRef = useRef<Record<string, boolean>>({});

  // Lists
  const hours = is24Hour
    ? Array.from({ length: 24 }, (_, i) => i) // 0-23
    : Array.from({ length: 12 }, (_, i) => i + 1); // 1-12

  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["AM", "PM"] as const;

  // Initialize view states when opening
  useEffect(() => {
    if (isOpen) {
      const { hour, minute } = parseTime24(value);
      setTempMinute(minute);
      setTempSecond(0);
      if (is24Hour) {
        setTempHour(hour);
      } else {
        const { hour12, period } = convert24To12(hour);
        setTempHour(hour12);
        setTempPeriod(period);
      }
      setFocusedSection("hour");
    }
  }, [isOpen, value, is24Hour]);

  // Open/Close transition animation states
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

  // Center selected item in scroll containers
  const centerItem = (
    ref: React.RefObject<HTMLDivElement | null>,
    id: string,
    behavior: ScrollBehavior = "smooth"
  ) => {
    const list = ref.current;
    const item = document.getElementById(id);
    if (list && item) {
      const itemHeight = 36; // h-9
      const targetScroll = item.offsetTop - list.clientHeight / 2 + itemHeight / 2;
      list.scrollTo({ top: targetScroll, behavior });
    }
  };

  // Sync scroll positions upon value updates
  useEffect(() => {
    if (isOpen && isRendered) {
      const scrollTimer = setTimeout(() => {
        centerItem(hourListRef, `time-hour-${tempHour}`, "auto");
        centerItem(minuteListRef, `time-minute-${tempMinute}`, "auto");
        centerItem(secondListRef, `time-second-${tempSecond}`, "auto");
        if (!is24Hour) {
          centerItem(periodListRef, `time-period-${tempPeriod}`, "auto");
        }
      }, 50);

      return () => clearTimeout(scrollTimer);
    }
  }, [isOpen, isRendered, is24Hour]);

  // Scroll snaps change values on scroll stop
  const handleScroll = (container: HTMLDivElement, type: "hour" | "minute" | "second" | "period") => {
    if (blockScrollUpdateRef.current[type]) return;

    if (scrollTimeoutRef.current[type]) {
      clearTimeout(scrollTimeoutRef.current[type]);
    }

    scrollTimeoutRef.current[type] = setTimeout(() => {
      const scrollTop = container.scrollTop;
      const itemHeight = 36;
      const activeIdx = Math.round(scrollTop / itemHeight);

      if (type === "hour") {
        const val = hours[activeIdx];
        if (val !== undefined && val !== tempHour) setTempHour(val);
      } else if (type === "minute") {
        const val = minutes[activeIdx];
        if (val !== undefined && val !== tempMinute) setTempMinute(val);
      } else if (type === "second") {
        const val = seconds[activeIdx];
        if (val !== undefined && val !== tempSecond) setTempSecond(val);
      } else if (type === "period") {
        const val = periods[activeIdx];
        if (val !== undefined && val !== tempPeriod) setTempPeriod(val);
      }
    }, 80);
  };

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (focusedSection === "minute") {
          setFocusedSection("hour");
        } else if (focusedSection === "second") {
          setFocusedSection("minute");
        } else if (focusedSection === "period") {
          setFocusedSection("second");
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (focusedSection === "hour") {
          setFocusedSection("minute");
        } else if (focusedSection === "minute") {
          setFocusedSection("second");
        } else if (focusedSection === "second" && !is24Hour) {
          setFocusedSection("period");
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (focusedSection === "hour") {
          const prevHour = is24Hour
            ? tempHour === 0 ? 23 : tempHour - 1
            : tempHour === 1 ? 12 : tempHour - 1;
          setTempHour(prevHour);
          centerItem(hourListRef, `time-hour-${prevHour}`);
        } else if (focusedSection === "minute") {
          const prevMinute = tempMinute === 0 ? 59 : tempMinute - 1;
          setTempMinute(prevMinute);
          centerItem(minuteListRef, `time-minute-${prevMinute}`);
        } else if (focusedSection === "second") {
          const prevSecond = tempSecond === 0 ? 59 : tempSecond - 1;
          setTempSecond(prevSecond);
          centerItem(secondListRef, `time-second-${prevSecond}`);
        } else if (focusedSection === "period" && !is24Hour) {
          const prevPeriod = tempPeriod === "AM" ? "PM" : "AM";
          setTempPeriod(prevPeriod);
          centerItem(periodListRef, `time-period-${prevPeriod}`);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (focusedSection === "hour") {
          const nextHour = is24Hour
            ? tempHour === 23 ? 0 : tempHour + 1
            : tempHour === 12 ? 1 : tempHour + 1;
          setTempHour(nextHour);
          centerItem(hourListRef, `time-hour-${nextHour}`);
        } else if (focusedSection === "minute") {
          const nextMinute = tempMinute === 59 ? 0 : tempMinute + 1;
          setTempMinute(nextMinute);
          centerItem(minuteListRef, `time-minute-${nextMinute}`);
        } else if (focusedSection === "second") {
          const nextSecond = tempSecond === 59 ? 0 : tempSecond + 1;
          setTempSecond(nextSecond);
          centerItem(secondListRef, `time-second-${nextSecond}`);
        } else if (focusedSection === "period" && !is24Hour) {
          const nextPeriod = tempPeriod === "AM" ? "PM" : "AM";
          setTempPeriod(nextPeriod);
          centerItem(periodListRef, `time-period-${nextPeriod}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedSection, is24Hour, tempHour, tempMinute, tempSecond, tempPeriod]);

  // Click handler to select and center items
  const handleItemClick = (val: number | "AM" | "PM", type: "hour" | "minute" | "second" | "period") => {
    // Block scroll listener updates temporarily during programatic clicks to avoid interference
    blockScrollUpdateRef.current[type] = true;

    if (type === "hour") {
      setTempHour(val as number);
      centerItem(hourListRef, `time-hour-${val}`);
    } else if (type === "minute") {
      setTempMinute(val as number);
      centerItem(minuteListRef, `time-minute-${val}`);
    } else if (type === "second") {
      setTempSecond(val as number);
      centerItem(secondListRef, `time-second-${val}`);
    } else if (type === "period") {
      setTempPeriod(val as "AM" | "PM");
      centerItem(periodListRef, `time-period-${val}`);
    }

    setTimeout(() => {
      blockScrollUpdateRef.current[type] = false;
    }, 200);
  };

  const toggleFormat = (mode24: boolean) => {
    if (mode24 === is24Hour) return;

    if (mode24) {
      const h24 = convert12To24(tempHour, tempPeriod);
      setTempHour(h24);
    } else {
      const { hour12, period } = convert24To12(tempHour);
      setTempHour(hour12);
      setTempPeriod(period);
    }
    setIs24Hour(mode24);
    setFocusedSection("hour");
  };

  const handleConfirm = () => {
    if (onChange) {
      const h24 = is24Hour ? tempHour : convert12To24(tempHour, tempPeriod);
      const formatted = `${pad(h24)}:${pad(tempMinute)}`;
      onChange({ target: { value: formatted } });
    }
    setIsOpen(false);
  };

  // Header display formatted time matching image
  const getHeaderDisplayTime = () => {
    if (is24Hour) {
      return `${pad(tempHour)}:${pad(tempMinute)}:${pad(tempSecond)}`;
    } else {
      return `${pad(tempHour)}:${pad(tempMinute)}:${pad(tempSecond)} ${tempPeriod}`;
    }
  };

  // Format string for input trigger display
  const getDisplayValue = () => {
    if (!value) return "";
    const { hour, minute } = parseTime24(value);
    if (is24Hour) {
      return `${pad(hour)}:${pad(minute)}`;
    } else {
      const { hour12, period } = convert24To12(hour);
      return `${pad(hour12)}:${pad(minute)} ${period}`;
    }
  };

  // Dynamic style calculations based on distance from selected value
  const getHourStyle = (h: number) => {
    const idx = hours.indexOf(h);
    const activeIdx = hours.indexOf(tempHour);
    const dist = Math.abs(idx - activeIdx);
    if (dist === 0) return "text-[#10b981] font-bold text-base scale-110";
    if (dist === 1) return "text-slate-500 font-medium text-sm";
    if (dist === 2) return "text-slate-400 text-xs";
    return "text-slate-300 text-[10px] opacity-70";
  };

  const getMinuteStyle = (m: number) => {
    const idx = minutes.indexOf(m);
    const activeIdx = minutes.indexOf(tempMinute);
    const dist = Math.abs(idx - activeIdx);
    if (dist === 0) return "text-[#10b981] font-bold text-base scale-110";
    if (dist === 1) return "text-slate-500 font-medium text-sm";
    if (dist === 2) return "text-slate-400 text-xs";
    return "text-slate-300 text-[10px] opacity-70";
  };

  const getSecondStyle = (s: number) => {
    const idx = seconds.indexOf(s);
    const activeIdx = seconds.indexOf(tempSecond);
    const dist = Math.abs(idx - activeIdx);
    if (dist === 0) return "text-[#10b981] font-bold text-base scale-110";
    if (dist === 1) return "text-slate-500 font-medium text-sm";
    if (dist === 2) return "text-slate-400 text-xs";
    return "text-slate-300 text-[10px] opacity-70";
  };

  const getPeriodStyle = (p: "AM" | "PM") => {
    const idx = periods.indexOf(p);
    const activeIdx = periods.indexOf(tempPeriod);
    const dist = Math.abs(idx - activeIdx);
    if (dist === 0) return "text-[#10b981] font-bold text-base scale-110";
    if (dist === 1) return "text-slate-500 font-medium text-sm";
    return "text-slate-300 text-xs";
  };

  return (
    <div className="w-full">
      {label && (
        <label className="flex items-center gap-2 mb-1.5 text-[11px] font-bold text-slate-500 tracking-[0.08em] uppercase">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Input */}
      <div className="relative">
        <input
          type="text"
          readOnly
          disabled={disabled}
          value={getDisplayValue()}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full px-3.5 py-2.5 pr-10 border-[1.5px] border-gray-300 rounded-[10px] outline-none text-sm text-[#0f172a] bg-white cursor-pointer transition-all duration-200 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
            }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(true)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Redesigned Center Screen Picker Modal */}
      {isRendered && (
        <div
          className={`fixed inset-0 bg-black/45 flex items-center justify-center z-[9999] p-4 transition-opacity duration-200 ${isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-[320px] p-5 overflow-hidden transition-all duration-200 ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Outlined Time Display (Legend style) */}
            <div className="relative border border-[#10b981]/50 rounded-[10px] px-3.5 py-3 mb-4 flex items-center justify-between">
              {/* Floating label */}
              <span className="absolute -top-2 left-3 bg-white px-1.5 text-[9px] font-bold text-[#10b981] uppercase tracking-wider">
                Time
              </span>

              {/* Time value */}
              <span className="text-sm font-semibold text-slate-800 tracking-wide font-mono">
                {getHeaderDisplayTime()}
              </span>

              {/* Right tools (Clock & X Close) */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-4 h-4 text-[#10b981] mr-0.5" />
                <div className="w-px h-3.5 bg-slate-200 mr-0.5" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-slate-600 rounded-full p-0.5 hover:bg-slate-100 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 12h/24h toggle segments */}
            <div className="mb-4">
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleFormat(false)}
                  className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md transition-all ${!is24Hour ? "bg-white text-[#10b981] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  12-Hour
                </button>
                <button
                  type="button"
                  onClick={() => toggleFormat(true)}
                  className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md transition-all ${is24Hour ? "bg-white text-[#10b981] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  24-Hour
                </button>
              </div>
            </div>

            {/* Cylindrical Spinner Grid */}
            <div className="relative border border-slate-100 rounded-xl bg-slate-50/50 p-2 flex items-center justify-center h-[200px] overflow-hidden select-none">
              {/* Highlight backdrop in the center row (h-9 is 36px) */}
              <div className="absolute left-2 right-2 top-[82px] h-9 bg-[#10b981]/8 border-y border-[#10b981]/15 pointer-events-none rounded-lg" />

              {/* Columns container */}
              <div className="flex items-center justify-center gap-2 w-full z-10">
                {/* Hours column */}
                <div
                  ref={hourListRef}
                  onScroll={(e) => handleScroll(e.currentTarget, "hour")}
                  onFocus={() => setFocusedSection("hour")}
                  className={`w-12 h-[200px] overflow-y-auto scrollbar-none snap-y snap-mandatory scroll-smooth relative transition-all rounded-md ${focusedSection === "hour" ? "bg-slate-100/40" : ""
                    }`}
                >
                  <div className="h-[82px]" />
                  {hours.map((h) => {
                    const isActive = tempHour === h;
                    return (
                      <button
                        key={h}
                        id={`time-hour-${h}`}
                        type="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => handleItemClick(h, "hour")}
                        className={`w-full h-9 flex items-center justify-center snap-center focus:outline-none transition-all ${getHourStyle(
                          h
                        )}`}
                      >
                        {is24Hour ? pad(h) : h}
                      </button>
                    );
                  })}
                  <div className="h-[82px]" />
                </div>

                <div className="text-slate-400 font-bold self-center mb-1">:</div>

                {/* Minutes column */}
                <div
                  ref={minuteListRef}
                  onScroll={(e) => handleScroll(e.currentTarget, "minute")}
                  onFocus={() => setFocusedSection("minute")}
                  className={`w-12 h-[200px] overflow-y-auto scrollbar-none snap-y snap-mandatory scroll-smooth relative transition-all rounded-md ${focusedSection === "minute" ? "bg-slate-100/40" : ""
                    }`}
                >
                  <div className="h-[82px]" />
                  {minutes.map((m) => {
                    const isActive = tempMinute === m;
                    return (
                      <button
                        key={m}
                        id={`time-minute-${m}`}
                        type="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => handleItemClick(m, "minute")}
                        className={`w-full h-9 flex items-center justify-center snap-center focus:outline-none transition-all ${getMinuteStyle(
                          m
                        )}`}
                      >
                        {pad(m)}
                      </button>
                    );
                  })}
                  <div className="h-[82px]" />
                </div>

                <div className="text-slate-400 font-bold self-center mb-1">:</div>

                {/* Seconds column */}
                <div
                  ref={secondListRef}
                  onScroll={(e) => handleScroll(e.currentTarget, "second")}
                  onFocus={() => setFocusedSection("second")}
                  className={`w-12 h-[200px] overflow-y-auto scrollbar-none snap-y snap-mandatory scroll-smooth relative transition-all rounded-md ${focusedSection === "second" ? "bg-slate-100/40" : ""
                    }`}
                >
                  <div className="h-[82px]" />
                  {seconds.map((s) => {
                    const isActive = tempSecond === s;
                    return (
                      <button
                        key={s}
                        id={`time-second-${s}`}
                        type="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => handleItemClick(s, "second")}
                        className={`w-full h-9 flex items-center justify-center snap-center focus:outline-none transition-all ${getSecondStyle(
                          s
                        )}`}
                      >
                        {pad(s)}
                      </button>
                    );
                  })}
                  <div className="h-[82px]" />
                </div>

                {/* AM/PM column (Only for 12h format) */}
                {!is24Hour && (
                  <>
                    <div className="w-1.5" />
                    <div
                      ref={periodListRef}
                      onScroll={(e) => handleScroll(e.currentTarget, "period")}
                      onFocus={() => setFocusedSection("period")}
                      className={`w-12 h-[200px] overflow-y-auto scrollbar-none snap-y snap-mandatory scroll-smooth relative transition-all rounded-md ${focusedSection === "period" ? "bg-slate-100/40" : ""
                        }`}
                    >
                      <div className="h-[82px]" />
                      {periods.map((p) => {
                        const isActive = tempPeriod === p;
                        return (
                          <button
                            key={p}
                            id={`time-period-${p}`}
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => handleItemClick(p, "period")}
                            className={`w-full h-9 flex items-center justify-center snap-center focus:outline-none transition-all ${getPeriodStyle(
                              p
                            )}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <div className="h-[82px]" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-5 mt-4 px-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-xs text-[#10b981] hover:text-[#0d9488] transition-colors font-bold uppercase tracking-wider"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
