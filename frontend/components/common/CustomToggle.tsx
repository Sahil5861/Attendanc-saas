"use client"

import React from "react";

interface CustomToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

const CustomToggle: React.FC<CustomToggleProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
}) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${checked ? "bg-emerald-500" : "bg-slate-300"
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"
                    }`}
            />
        </button>
    );
};

export default CustomToggle;