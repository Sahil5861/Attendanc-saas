"use client";

import { ReactNode } from "react";
import Can from "./Can";

interface PrimaryButtonProps {
  title: string;
  permission?: string;
  onClick?: () => void;
  btnType?: "button" | "submit" | "reset";
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  permission,
  onClick,
  btnType,
  icon,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  return (

    <Can permission={permission}>
      <button
        onClick={onClick}
        type={btnType ?? "button"}
        disabled={disabled || loading}
        style={{
          background: "linear-gradient(135deg, #059669, #0891b2)",
          color: "#fff",
          border: "none",
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
          textAlign: "center",
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