"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: any) => void;
  placeholder?: string;
  width?: number | string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  width = 250,
}: SearchInputProps) {
  return (
    <div style={{ position: "relative", width }}>
      <svg
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#94a3b8",
        }}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          paddingLeft: 38,
          paddingRight: 16,
          paddingTop: 10,
          paddingBottom: 10,
          border: "1.5px solid #d1fae5",
          borderRadius: 10,
          fontSize: 14,
          outline: "none",
          color: "#0f172a",
          background: "#fff",
          transition: "border-color .2s, box-shadow .2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#10b981";
          e.target.style.boxShadow =
            "0 0 0 3px rgba(16,185,129,.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#d1fae5";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}