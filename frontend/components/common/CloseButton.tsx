"use client";

import { ReactNode } from "react";

interface CloseButtonProps {
  title: string;
  onClick?: () => void;
  icon?: ReactNode
  loading?: boolean;
  disabled?: boolean;
}

export default function CloseButton({
  title,
  onClick,
  icon,
  loading = false,
  disabled = false,
}: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        border: "1.5px solid #e2e8f0", background: "#fff",
        color: "#64748b", fontSize: 18, lineHeight: 1,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: "10px 20px",
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 7,
        transition: "transform .2s, box-shadow .2s",
        whiteSpace: "nowrap",
        opacity: disabled || loading ? 0.7 : 1,
      }}     
    >
      {icon}
      {loading ? "Loading..." : title}
    </button>
  );
}