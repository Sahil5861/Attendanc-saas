"use client";

import { ReactNode } from "react";

interface DangerButtonProps {
  title: string;
  onClick?: () => void;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  outline?: boolean;
}

export default function DangerButton({
  title,
  onClick,
  icon,
  loading = false,
  disabled = false,
  outline = true,
}: DangerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: outline ? "transparent" : "#dc2626",
        color: outline ? "#dc2626" : "#fff",
        border: outline
          ? "1.5px solid #fee2e2"
          : "1.5px solid #dc2626",
        borderRadius: 8,
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "all .15s",
        display: "flex",
        alignItems: "center",
        gap: 5,
        opacity: disabled || loading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;

        if (outline) {
          e.currentTarget.style.background = "#fef2f2";
          e.currentTarget.style.borderColor = "#fca5a5";
        } else {
          e.currentTarget.style.background = "#b91c1c";
        }
      }}
      onMouseLeave={(e) => {
        if (outline) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "#fee2e2";
        } else {
          e.currentTarget.style.background = "#dc2626";
        }
      }}
    >
      {icon}
      {loading ? "Loading..." : title}
    </button>
  );
}