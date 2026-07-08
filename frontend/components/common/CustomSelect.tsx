// components/common/CustomSelect.tsx
"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string | number | boolean;
}

interface CustomSelectProps {
  label?: string;
  value?: string | number | boolean;
  placeholder?: string;
  loading?: boolean;
  loadingText?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  options: Option[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
}

export default function CustomSelect({
  label,
  value,
  placeholder = "— Select —",
  loading = false,
  loadingText = "Loading…",
  searchable = false,
  disabled = false,
  required = false,
  error,
  options = [],
  onChange,
  onBlur,
  onFocus,
}: CustomSelectProps) {
  const uid = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);

  // Find currently selected option
  const selected = options.find((o) => String(o.value) === String(value ?? ""));

  // Filter options if searchable
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(searchVal.toLowerCase()))
    : options;

  // Click outside listener to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchVal("");
        setFocused(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync scrolling of highlighted option
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const el = listRef.current.children[highlighted] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const handleSelect = (opt: Option) => {
    if (onChange) {
      // Mock Event structure to work seamlessly with parent onChange handlers
      const event = {
        target: {
          value: String(opt.value),
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
    setOpen(false);
    setSearchVal("");
    setFocused(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearchVal("");
      setHighlighted(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && filtered[highlighted]) {
        handleSelect(filtered[highlighted]);
      } else if (filtered.length > 0) {
        // Select the first matching result when Enter is pressed
        handleSelect(filtered[0]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    setHighlighted(0);
    if (!open) setOpen(true);
  };

  const isOpen = open && !disabled && !loading;
  const hasError = !!error;
  const hasValue = selected !== undefined;

  // Determine display value for trigger
  const getInputValue = () => {
    if (focused || open) {
      return searchVal;
    }
    return selected?.label ?? "";
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={uid}
          className={`block mb-1.5 text-[11px] font-bold tracking-[0.08em] uppercase ${
            hasError ? "text-red-500" : "text-slate-500"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Container */}
      {loading ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-[10px] text-sm bg-slate-50 text-slate-400">
          <svg
            className="w-3.5 h-3.5 animate-spin flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>{loadingText}</span>
        </div>
      ) : (
        <div className="relative w-full">
          {searchable ? (
            <input
              id={uid}
              type="text"
              disabled={disabled}
              value={getInputValue()}
              placeholder={selected?.label ?? placeholder}
              onChange={handleInputChange}
              onFocus={(e) => {
                setFocused(true);
                setOpen(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                // only trigger blur if focus leaves the container
                if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                  setFocused(false);
                  onBlur?.(e);
                }
              }}
              onKeyDown={handleKeyDown}
              className={`w-full px-3.5 py-2.5 pr-10 border-[1.5px] rounded-[10px] text-sm text-[#0f172a] bg-white outline-none transition-all duration-200 ${
                isOpen ? "border-[#10b981] ring-2 ring-[#10b981]/10 rounded-b-none" : "border-gray-300"
              } ${hasError ? "border-red-500 ring-2 ring-red-500/10" : ""} ${
                disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer"
              }`}
            />
          ) : (
            <button
              id={uid}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setOpen((v) => !v);
                  setFocused(true);
                }
              }}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                  setFocused(false);
                  onBlur?.(e);
                }
              }}
              onKeyDown={handleKeyDown}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 border-[1.5px] rounded-[10px] text-sm outline-none text-left transition-all duration-200 ${
                hasValue ? "text-[#0f172a] font-medium" : "text-slate-400"
              } ${isOpen ? "border-[#10b981] ring-2 ring-[#10b981]/10 rounded-b-none" : "border-gray-300"} ${
                hasError ? "border-red-500 ring-2 ring-red-500/10" : ""
              } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer"}`}
            >
              <span className="truncate">{selected?.label ?? placeholder}</span>
            </button>
          )}

          {/* Right Chevron Down Icon */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#10b981]" : ""}`}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      {/* Options Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#10b981] border-t-0 rounded-b-[10px] shadow-lg max-h-[220px] overflow-hidden">
          <ul ref={listRef} className="max-h-[220px] overflow-y-auto py-1 list-none scrollbar-thin">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">No options found</li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value ?? "");
                const isHighlighted = idx === highlighted;

                return (
                  <li
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer border-l-2 transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-[#10b981] font-bold border-l-[#10b981]"
                        : isHighlighted
                        ? "bg-slate-50 text-slate-800 border-l-slate-200"
                        : "text-slate-700 border-l-transparent"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-[#10b981]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}