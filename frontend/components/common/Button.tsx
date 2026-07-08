"use client";

import { ReactNode } from "react";
import Can from "./Can";

type ButtonType =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "danger";

interface ButtonProps {
  title: string;
  onClick?: () => void;
  permission?: string;
  icon?: ReactNode;
  type?: ButtonType;
  outline?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const colors = {
  primary: {
    bg: "#2563eb",
    border: "#2563eb",
    text: "#2563eb",
    hover: "#1d4ed8",
    light: "#eff6ff",
  },

  secondary: {
    bg: "#64748b",
    border: "#64748b",
    text: "#64748b",
    hover: "#475569",
    light: "#f8fafc",
  },

  success: {
    bg: "#059669",
    border: "#059669",
    text: "#059669",
    hover: "#047857",
    light: "#f0fdf4",
  },

  info: {
    bg: "#0891b2",
    border: "#0891b2",
    text: "#0891b2",
    hover: "#0e7490",
    light: "#ecfeff",
  },

  danger: {
    bg: "#dc2626",
    border: "#dc2626",
    text: "#dc2626",
    hover: "#b91c1c",
    light: "#fef2f2",
  },
};

export default function Button({
  title,
  onClick,
  icon,
  permission,
  type = "primary",
  outline = false,
  loading = false,
  disabled = false,
}: ButtonProps) {
  const color = colors[type];

  return (

    <Can permission={permission}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,

          background: outline ? "#fff" : color.bg,
          color: outline ? color.text : "#fff",
          border: `1.5px solid ${color.border}`,
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 600,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          transition: "all .15s",

          opacity: disabled || loading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (disabled || loading) return;

          if (outline) {
            e.currentTarget.style.background = color.light;
          } else {
            e.currentTarget.style.background =
              color.hover;
          }
        }}
        onMouseLeave={(e) => {
          if (outline) {
            e.currentTarget.style.background =
              "#fff";
          } else {
            e.currentTarget.style.background =
              color.bg;
          }
        }}
      >
        {icon}

        {loading ? "Loading..." : title}
      </button>
    </Can>
  );
}