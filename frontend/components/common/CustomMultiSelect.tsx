"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface Props {
  label?: string;
  placeholder?: string;

  options: MultiSelectOption[];

  value: string[];

  onChange: (values: string[]) => void;

  disabled?: boolean;
}

export default function CustomMultiSelect({
  label,
  placeholder = "Search...",
  options,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOptions = options.filter((item) =>
    value.includes(item.value)
  );

  const filteredOptions = useMemo(() => {
    return options.filter((item) => {
      if (value.includes(item.value)) return false;

      const q = search.toLowerCase();

      return (
        item.label.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q)
      );
    });
  }, [options, value, search]);

  const addOption = (id: string) => {
    onChange([...value, id]);
    setSearch("");
    setOpen(true);
  };

  const removeOption = (id: string) => {
    onChange(value.filter((x) => x !== id));
  };

  return (
    <div ref={wrapperRef} className="relative w-full">

      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
        </label>
      )}

      <div
        onClick={() => !disabled && setOpen(true)}
        className={`min-h-[46px] rounded-xl border border-gray-300 bg-white px-3 py-2 ${
          disabled ? "cursor-not-allowed bg-gray-100" : "cursor-text"
        }`}
      >
        <div className="flex flex-wrap gap-2 items-center">

          {selectedOptions.map((item) => (
            <div
              key={item.value}
              className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
            >
              {item.label}

              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item.value);
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          {!disabled && (
            <div className="flex items-center flex-1 min-w-[150px]">

              <Search
                size={16}
                className="mr-2 text-gray-400 shrink-0"
              />

              <input
                value={search}
                onFocus={() => setOpen(true)}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent outline-none text-sm"
              />

            </div>
          )}

        </div>
      </div>

      {open && !disabled && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">

          {filteredOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => addOption(item.value)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="font-medium text-sm">
                {item.label}
              </div>

              {item.subtitle && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.subtitle}
                </div>
              )}
            </button>
          ))}

        </div>
      )}
    </div>
  );
}