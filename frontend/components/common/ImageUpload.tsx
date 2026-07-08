"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";

interface ImageUploadProps {
  value?: File | null | string;
  preview?: string;
  onChange?: (file: File | null) => void;
}

export default function ImageUpload({
  value,
  preview,
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(preview || null);

  const handleFile = (file: File | null) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
    onChange?.(file);
  };

  useEffect(() => {
    // `value` can be a File (freshly picked), a string (existing image URL
    // from the server), or null/undefined (nothing set yet). Each needs
    // different handling before it can go into `image`, which is a string.
    if (!value) {
      setImage(null);
      return;
    }

    if (typeof value === "string") {
      setImage(value);
      return;
    }

    // value is a File — convert it to a blob URL so <img src> can use it
    const objectUrl = URL.createObjectURL(value);
    setImage(objectUrl);

    // Clean up the blob URL when value changes again or component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [value])

  return (
    <div className="col-span-2">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        Profile Image
      </label>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {image ? (
                <img
                  src={image}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera
                  size={30}
                  className="text-slate-400"
                />
              )}
            </div>

            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  onChange?.(null);

                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow transition hover:bg-red-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Upload */}
          <div className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              <Upload size={16} />
              Upload Image
            </button>

            <p className="text-xs text-slate-500">
              JPG, PNG or WEBP • Max 5 MB
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
}