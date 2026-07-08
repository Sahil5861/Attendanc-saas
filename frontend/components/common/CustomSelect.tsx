// components/common/CustomSelect.tsx
"use client";

import React, { useState, useRef, useEffect, useId } from "react";

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
  options,
  onChange,
  onBlur,
  onFocus,
}: CustomSelectProps) {
  const uid            = useId();
  const containerRef   = useRef<HTMLDivElement>(null);
  const searchRef      = useRef<HTMLInputElement>(null);
  const listRef        = useRef<HTMLUListElement>(null);

  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const [focused, setFocused]   = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);

  const selected = options.find((o) => String(o.value) === String(value ?? ""));

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
    if (open) {
      // scroll highlighted into view
      const idx = filtered.findIndex((o) => String(o.value) === String(value ?? ""));
      setHighlighted(idx);
    }
  }, [open]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const el = listRef.current.children[highlighted] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const handleSelect = (opt: Option) => {
    // Synthesise a ChangeEvent so existing onChange handlers work unchanged
    const nativeSelect = document.createElement("select");
    const nativeOption = document.createElement("option");
    nativeOption.value = String(opt.value);
    nativeSelect.appendChild(nativeOption);
    nativeSelect.value = String(opt.value);
    const event = Object.create(new Event("change"), {
      target:          { value: nativeSelect },
      currentTarget:   { value: nativeSelect },
    }) as React.ChangeEvent<HTMLSelectElement>;
    onChange?.(event);

    setOpen(false);
    setSearch("");
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
    if (e.key === "Escape")     { setOpen(false); setSearch(""); }
    if (e.key === "ArrowDown")  { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    }
  };

  const isOpen    = open && !disabled && !loading;
  const hasError  = !!error;
  const hasValue  = selected !== undefined;

  // ── Styles ──────────────────────────────────────────────────────────
  // const borderColor = hasError ? "#f87171" : focused || isOpen ? "#10b981" : "rgb(209 250 229)";
  const borderColor = hasError ? "#f87171" : focused || isOpen ? "#10b981" : "rgb(209, 213, 219)";
  const boxShadow   = hasError
    ? "0 0 0 3px rgba(248,113,113,.12)"
    : focused || isOpen
      ? "0 0 0 3px rgba(16,185,129,.12)"
      : "none";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>

      {/* Label */}
      {label && (
        <label
          htmlFor={uid}
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 11,
            fontWeight: 700,
            color: hasError ? "#ef4444" : "#64748b",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
          {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* Trigger */}
      {loading ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px",
          border: "1.5px solid #d1d5db",
          borderRadius: 10, fontSize: 14,
          background: "#f8fafc", color: "#94a3b8",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
            style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>{loadingText}</span>
        </div>
      ) : (
        <button
          id={uid}
          type="button"
          disabled={disabled}
          onClick={() => { if (!disabled) { setOpen((v) => !v); setFocused(true); } }}
          onFocus={(e) => { setFocused(true);  onFocus?.(e); }}
          onBlur={(e)  => {
            // only blur if focus left the whole container
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              setFocused(false);
              onBlur?.(e);
            }
          }}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? uid : undefined}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            padding: "10px 14px",
            border: `1.5px solid ${borderColor}`,
            borderRadius: isOpen ? "10px 10px 0 0" : 10,
            fontSize: 14,
            fontWeight: hasValue ? 500 : 400,
            color: hasValue ? "#0f172a" : "#94a3b8",
            background: disabled ? "#f8fafc" : "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
            outline: "none",
            boxShadow,
            transition: "border-color .15s, box-shadow .15s, border-radius .1s",
            textAlign: "left",
          }}
        >
          {/* Selected label or placeholder */}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected?.label ?? placeholder}
          </span>

          {/* Chevron */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={isOpen ? "#10b981" : "#94a3b8"} strokeWidth="2.2" strokeLinecap="round"
            style={{
              flexShrink: 0,
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform .2s, stroke .15s",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Error message */}
      {hasError && (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999,
            background: "#fff",
            border: `1.5px solid #10b981`,
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(16,185,129,.12), 0 2px 8px rgba(0,0,0,.06)",
            overflow: "hidden",
          }}
        >
          {/* Search box */}
          {searchable && (
            <div style={{
              padding: "8px 10px",
              borderBottom: "1.5px solid #f0fdf4",
              background: "#f8fffe",
            }}>
              <div style={{ position: "relative" }}>
                <svg
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setHighlighted(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search…"
                  style={{
                    width: "100%",
                    padding: "7px 10px 7px 30px",
                    border: "1.5px solid #d1fae5",
                    borderRadius: 7,
                    fontSize: 13,
                    outline: "none",
                    background: "#fff",
                    color: "#0f172a",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#10b981"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#d1fae5"; }}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <ul
            ref={listRef}
            style={{
              maxHeight: 220, overflowY: "auto",
              margin: 0, padding: "4px 0",
              listStyle: "none",
            }}
          >
            {filtered.length === 0 ? (
              <li style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                No options found
              </li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected    = String(opt.value) === String(value ?? "");
                const isHighlighted = idx === highlighted;

                return (
                  <li
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                    onMouseEnter={() => setHighlighted(idx)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 14px",
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "#059669" : "#1e293b",
                      background: isSelected
                        ? "#f0fdf4"
                        : isHighlighted
                          ? "#f8fffe"
                          : "transparent",
                      cursor: "pointer",
                      transition: "background .1s",
                      borderLeft: isSelected ? "3px solid #10b981" : "3px solid transparent",
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
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

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}