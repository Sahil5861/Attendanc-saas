import { useEffect, useState } from "react";
import { LogIn, LogOut, Clock, Zap, User } from "lucide-react";
import SecondaryButton from "@/components/common/SecondaryButton";
import PrimaryButton from "@/components/common/PrimaryButton";

interface Props {
  userName: string;
  checkIn: string | null;
  checkOut: string | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading?: boolean;
}

export default function HeroAttendanceCard({
  userName,
  checkIn,
  checkOut,
  onCheckIn,
  onCheckOut,
  loading = false,
}: Props) {
  const [now,     setNow]     = useState(new Date());
  const [elapsed, setElapsed] = useState("00h 00m 00s");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!checkIn || checkOut) return;
    const t = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(checkIn).getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      setElapsed(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(t);
  }, [checkIn, checkOut]);

  const formatTime = (val: string | null) => {
    if (!val) return "--";
    return new Date(val).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const greeting = () => {
    const h = now.getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const isDone = !!checkIn && !!checkOut;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Top accent strip ── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

      <div className="px-8 pt-5 pb-5">

        {/* ── Header row ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-5">

          {/* Left: avatar + name + greeting */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500 flex-shrink-0">
              <User size={26} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                {greeting()}
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {userName || "Employee"} 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Mark your attendance and track your working hours.
              </p>
            </div>
          </div>

          {/* Right: live clock */}
          <div className="lg:text-right">
            <p className="text-4xl font-extrabold text-slate-800 tabular-nums tracking-tight leading-none">
              {now.toLocaleTimeString("en-IN", {
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
              })}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {now.toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            {/* Currently working pill — right aligned on desktop */}
            {checkIn && !checkOut && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600">Currently working</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="my-6 border-t border-slate-50" />

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <StatPill
            label="Check In"
            value={formatTime(checkIn)}
            active={!!checkIn}
            color="teal"
          />
          <StatPill
            label="Check Out"
            value={formatTime(checkOut)}
            active={!!checkOut}
            color="red"
          />
          <StatPill
            label="Working Hours"
            value={
              checkIn && checkOut
                ? formatDuration(checkIn, checkOut)
                : checkIn
                ? elapsed
                : "00h 00m 00s"
            }
            active={!!checkIn}
            color="violet"
          />
          {/* <StatPill
            label="Auto Checkout"
            value="08:00 PM"
            active={false}
            color="amber"
            isAuto
          /> */}
        </div>

        {/* ── Action row ── */}
        <div className="mt-6 mb-6 flex items-center gap-3 flex-wrap">
          {isDone ? (
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <Clock size={14} className="text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                Attendance completed for today
              </span>
            </div>
          ) : !checkIn ? (
            <SecondaryButton
              onClick={onCheckIn}
              loading={loading}
              disabled={loading}
              icon={<LogIn size={16} />}
              title="Check In"
            />
          ) : (
            <PrimaryButton
              title="Check Out"
              onClick={onCheckOut}
              disabled={loading}
              loading={loading}
              icon={<LogOut size={16} />}
            />
          )}

          {/* Status badge */}
          <span className={`text-xs font-semibold px-5 py-4 rounded-full border ${
            isDone
              ? "bg-slate-50 border-slate-200 text-slate-400"
              : checkIn
              ? "bg-amber-50 border-amber-200 text-amber-600"
              : "bg-slate-50 border-slate-200 text-slate-400"
          }`}>
            {isDone
              ? "✓ Done for today"
              : checkIn
              ? "⏱ Shift in progress"
              : "Not checked in yet"}
          </span>
        </div>

      </div>
    </div>
  );
}

// ── StatPill ──────────────────────────────────────────────────────────
function StatPill({
  label, value, active, color, isAuto = false,
}: {
  label: string;
  value: string;
  active: boolean;
  color: "teal" | "red" | "violet" | "amber";
  isAuto?: boolean;
}) {
  const bg: Record<string, string> = {
    teal:   active ? "bg-teal-50   border-teal-100"   : "bg-slate-50 border-slate-100",
    red:    active ? "bg-red-50    border-red-100"    : "bg-slate-50 border-slate-100",
    violet: active ? "bg-violet-50 border-violet-100" : "bg-slate-50 border-slate-100",
    amber:  "bg-amber-50 border-amber-100",
  };
  const dot: Record<string, string> = {
    teal:   active ? "bg-teal-400"   : "bg-slate-200",
    red:    active ? "bg-red-400"    : "bg-slate-200",
    violet: active ? "bg-violet-400" : "bg-slate-200",
    amber:  "bg-amber-400",
  };
  const txt: Record<string, string> = {
    teal:   active ? "text-teal-800"   : "text-slate-300",
    red:    active ? "text-red-700"    : "text-slate-300",
    violet: active ? "text-violet-800" : "text-slate-300",
    amber:  "text-amber-700",
  };

  return (
    <div className={`rounded-2xl border px-5 py-4 flex flex-col gap-3 ${bg[color]}`}>
      <div className="flex items-center gap-2">
        {isAuto
          ? <Zap size={12} className="text-amber-400 flex-shrink-0" />
          : <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot[color]}`} />
        }
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 truncate">
          {label}
        </p>
      </div>
      <p className={`text-xl font-bold tabular-nums leading-none text-black ${txt[color]}`}>
        {value}
      </p>
    </div>
  );
}

function formatDuration(ci: string, co: string): string {
  const diff = Math.floor((new Date(co).getTime() - new Date(ci).getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${h}h ${m}m ${s}s`;
}