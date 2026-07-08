"use client";

import React from "react";

interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function CustomTextarea({
  label,
  error,
  className = "",
  ...props
}: CustomTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}

      <textarea
        {...props}
        className={`
          w-full rounded-lg border border-gray-300
          bg-white px-3 py-3
          text-sm text-gray-900
          placeholder:text-gray-500
          outline-none
          transition-all
          focus:border-emerald-500
          focus:ring-2 focus:ring-emerald-100
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          ${className}
        `}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}