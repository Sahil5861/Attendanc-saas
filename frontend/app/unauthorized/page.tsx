
"use client";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6fbfa] px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
          <span className="text-4xl">🔒</span>
        </div>

        <h1 className="text-7xl font-bold text-red-500">403</h1>

        <h2 className="mt-4 text-3xl font-bold text-slate-800">
          Access Denied
        </h2>

        <p className="mt-3 text-slate-500">
          You do not have permission to access this page.
          Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/super-admin/dashboard"
            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition"
          >
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}