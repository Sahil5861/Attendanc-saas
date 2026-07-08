"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 48,
        height: 26,
        border: "none",
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "#10b981" : "#e2e8f0",
        position: "relative",
        transition: "all .25s ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 25 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "all .25s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,.15)",
        }}
      />
    </button>
  );
}