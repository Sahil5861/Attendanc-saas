"use client";

import { ReactNode } from "react";
import Can from "./Can";

interface SecondaryButtonProps {
  title: string;
  onClick?: () => void;
  icon?: ReactNode
  loading?: boolean;
  disabled?: boolean;
  permission?: string;
}

export default function SecondaryButton({
  title,
  onClick,
  icon,
  loading = false,
  disabled = false,
  permission
}: SecondaryButtonProps) {
  return (

    <Can permission={permission}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          border:  " 1px solid #059669",
          color: "#059669",
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 700,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 7,
          transition: "transform .2s, box-shadow .2s",
          whiteSpace: "nowrap",
          opacity: disabled || loading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (disabled || loading) return;
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(5,150,105,.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {icon}
        {loading ? "Loading..." : title}
      </button>
    </Can>
  );
}