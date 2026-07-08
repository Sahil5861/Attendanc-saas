"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  UserCheck,
  UserX,
  Plane,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { getEmployees, updateAttendance } from "@/services/branch.service";
import Modal from "@/components/attendance/modal";
import toast from "react-hot-toast";
import { loadBranchDashboardData } from "@/services/super-admin.service";

// ── Status config — single source of truth for colors/labels ──────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string; value: string }> = {
  "P": { label: "Present", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", value: 'present' },
  "A": { label: "Absent", bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-500", value: 'absent' },
  "L": { label: "Leave", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", value: 'onLeave' },
  "H": { label: "Holiday", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", value: 'holiday' },
  "-": { label: "No record", bg: "bg-slate-50", text: "text-slate-300", border: "border-slate-100", dot: "bg-slate-300", value: '-' },
};


const defaultForm = {
  id: '',
  checkIn: '',
  checkOut: '',
  status: '',
}

// Merged into a single shape — this is what actually comes back per attendance
// record (both the calendar-cell lookup AND the "open details" drawer use this).
// Previously this was split across two mismatched interfaces (`EmployeeAttendanceRecord`
// with only attendanceDate/status, and `AttendanceRecord` with only _id/checkIn/checkOut/
// workingHours), which is what caused the TypeScript build error.
interface EmployeeAttendanceRecord {
  _id?: string;
  attendanceDate: string;
  status: "present" | "absent" | "onLeave" | string;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
}

interface DashboardData {
  todayPresent: number;
  todayAbsent: number;
  todayOnLeave: number;
}

interface EmployeeData {
  _id: string;
  joiningDate: string | Date;
  name: string;
  role: string;
  attendance: EmployeeAttendanceRecord[] | undefined;
}

export default function AttendancePage() {
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);

  const today = new Date();
  const [currentYear, setcurrentYear] = useState(today.getFullYear());
  const [currentMonth, setcurrentMonth] = useState(today.getMonth());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i);

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString("en-In", {
    month: "long", year: "numeric"
  });

  const reset = () => {
    setcurrentMonth(today.getMonth())
    setcurrentYear(today.getFullYear())
  }

  // Fixed: this previously copied the goNextMonth wrap-around logic (checked
  // currentMonth == 11 and reset to 0), which is backwards for "previous month".
  // Going back from December should land on November of the SAME year, and
  // going back from January should land on December of the PREVIOUS year.
  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setcurrentMonth(11);
      setcurrentYear((y) => y - 1);
    }
    else {
      setcurrentMonth((m) => m - 1);
    }
  }

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setcurrentMonth(0);
      setcurrentYear((y) => y + 1);
    }
    else {
      setcurrentMonth((m) => m + 1);
    }
  }

  const buildDateForDay = (day: number) => {
    return new Date(currentYear, currentMonth, day);
  }

  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [data, setData] = useState<DashboardData>({
    todayPresent: 0,
    todayAbsent: 0,
    todayOnLeave: 0,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data.data);
  }

  useEffect(() => {
    const branchstr = localStorage.getItem('activeBranch') || null;
    if (!branchstr) return;

    const branch = JSON.parse(branchstr);
    const branchId = branch?._id;
    if (!branchId) return;
    const loadData = async () => {
      const res = await loadBranchDashboardData(branchId)
      setData(res.data.data);
    }
    loadData();
  }, [])

  const formattedTime = (dateString?: string) => {
    if (!dateString) return;

    return new Date(dateString).toLocaleString("en-In", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatWorkingHours = (hours?: number) => {
    if (!hours) return;

    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;

    return `${hrs}h ${mins}m`;
  }

  useEffect(() => {
    setLoading(true);
    fetchEmployees()
    setLoading(false);
  }, [])

  const openAttendance = (
    employeeId: string,
    employeeName: string,
    day: number,
    date: Date,
    status: string,
    record: EmployeeAttendanceRecord | undefined
  ) => {
    const isoDate = date.toISOString();

    if (record) {
      setSelectedAttendance({
        id: record._id || '',
        employeeId: employeeId,
        employeeName,
        day,
        date: isoDate,
        month: date.getMonth(),
        year: date.getFullYear(),
        status,
        checkIn: record.checkIn || '',
        checkOut: record.checkOut || '',
        workingHours: record.workingHours || '',
      });
    }
    else {
      setSelectedAttendance({
        id: '',
        employeeId: employeeId,
        employeeName,
        day,
        date: isoDate,
        month: date.getMonth(),
        year: date.getFullYear(),
        status,
        checkIn: '',
        checkOut: '',
        workingHours: '',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm(defaultForm);
  }

  const formatTimeForInput = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const handleEditAttendance = () => {
    setOpen(true);

    setForm({
      id: selectedAttendance.id,
      checkIn: formatTimeForInput(selectedAttendance?.checkIn),
      checkOut: formatTimeForInput(selectedAttendance?.checkOut),
      status: STATUS_CONFIG[selectedAttendance?.status]?.value ?? '',
    })
  }

  const createWorkingHours = (chekIn: Date | string, chekcOut: Date | string) => {
    const start = new Date(chekIn);
    const end = new Date(chekcOut);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid check-in or check-out date");
    }

    const diffMs = end.getTime() - start.getTime();

    const hours = Number(
      (diffMs / (1000 * 60 * 60)).toFixed(2)
    );

    return hours;
  }

  const handleSubmit = async () => {
    try {
      const attendanceDate = new Date(selectedAttendance.date);

      attendanceDate.setHours(0, 0, 0, 0);

      const buildISO = (date: Date, timeStr: string): string => {
        // timeStr = "HH:MM" from input[type=time]
        const [hours, minutes] = timeStr.split(":").map(Number);
        const dt = new Date(date);
        dt.setHours(hours, minutes, 0, 0);
        return dt.toISOString();
      };

      const checkInISO = form.checkIn ? buildISO(attendanceDate, form.checkIn) : "";
      const checkOutISO = form.checkOut ? buildISO(attendanceDate, form.checkOut) : "";

      const payload = {
        id: form.id,
        employeeId: selectedAttendance.employeeId,
        status: form.status,
        attendanceDate: attendanceDate.toISOString(),
        checkIn: checkInISO,
        checkOut: checkOutISO,
        workingHours: checkInISO && checkOutISO
          ? createWorkingHours(checkInISO, checkOutISO)
          : 0,
      };

      const res = await updateAttendance(payload);
      setOpen(false);
      setSelectedAttendance(null);

      toast.success(res.data.message);
      fetchEmployees();
    } catch (error) {
      console.error(error)
    }
  }

  // Formats the day/month/year stored on selectedAttendance into a real date string.
  // (Previously the drawer just hardcoded the literal text "June 2026" in two places.)
  const formatSelectedDate = () => {
    if (!selectedAttendance) return "";
    const d = new Date(selectedAttendance.year, selectedAttendance.month, selectedAttendance.day);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <>
      <div className="p-6 bg-slate-50 min-h-screen">

        {/* ── Header ── */}
        <div className="mb-7 flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Attendance Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitor and manage employee attendance
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            Today: {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm hover:shadow-md hover:shadow-emerald-100 transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <UserCheck size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Present Today</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{data.todayPresent} </h2>
            <p className="text-xs text-slate-400 mt-1">85.7% attendance rate</p>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm hover:shadow-md hover:shadow-rose-100 transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-sm">
                <UserX size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Absent Today</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{data.todayAbsent}</h2>
            <p className="text-xs text-slate-400 mt-1">Needs follow-up</p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md hover:shadow-amber-100 transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
                <Plane size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">On Leave</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{data.todayOnLeave}</h2>
            <p className="text-xs text-slate-400 mt-1">Approved leaves</p>
          </div>

        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "-").map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              {cfg.label} <span className="text-slate-300">({key})</span>
            </span>
          ))}
        </div>

        {/* ── Monthly Register ── */}
        <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">

          {/* Card header */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-emerald-50 bg-emerald-50/30 px-5 py-4">

            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
                <Calendar size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Monthly Attendance Register
                </h2>

                <p className="text-xs text-slate-500">
                  {monthLabel}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

              {/* Month */}
              <select
                value={currentMonth}
                onChange={(e) => setcurrentMonth(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              {/* Year */}
              <select
                value={currentYear}
                onChange={(e) => setcurrentYear(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {Array.from({ length: 8 }, (_, i) => {
                  const year = new Date().getFullYear() - 3 + i;

                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              {/* reset  */}
              <button
                onClick={reset}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-emerald-200 hover:text-emerald-600"
              >
                <RotateCcw size={16}/>
              </button>

              {/* Navigation */}
              <button
                onClick={goPrevMonth}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-emerald-200 hover:text-emerald-600"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={goNextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-emerald-200 hover:text-emerald-600"
              >
                <ChevronRight size={16} />
              </button>

            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr>
                  <th className="p-3 px-4 text-left sticky left-0 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-100 z-10">
                    Employee
                  </th>
                  {days.map((day) => {
                    const date = day + 1;
                    const cellDate = buildDateForDay(date);

                    const dayOfWeek = cellDate.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return (
                      <th
                        key={day}
                        className={`p-2 text-center text-xs font-semibold border-b border-slate-100 ${isWeekend ? "bg-red-100 text-slate-400 border" : "bg-slate-50 text-slate-500"
                          }`}
                        style={{ minWidth: 38 }}
                      >
                        {date}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {

                  employees.length > 0 ? (
                    employees.map((employee, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={`border-t border-slate-50 ${rowIdx % 2 === 1 ? "bg-slate-50/40" : "bg-white"}`}
                      >
                        {/* Sticky employee column */}
                        <td className={`p-3 px-4 sticky left-0 z-10 ${rowIdx % 2 === 1 ? "bg-slate-50" : "bg-white"}`}>
                          <div className="flex items-center gap-2.5">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-800 whitespace-nowrap">{employee.name}</p>
                              <p className="text-[11px] text-slate-400 whitespace-nowrap">{employee.role}</p>
                            </div>
                          </div>
                        </td>

                        {days.map((day) => {
                          const date = day + 1;
                          const currentDate = new Date();
                          currentDate.setHours(0, 0, 0, 0);

                          const cellDate = buildDateForDay(date);

                          const dayOfWeek = cellDate.getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                          const joiningDate = new Date(employee.joiningDate);
                          joiningDate.setHours(0, 0, 0, 0);

                          const isFutureDate = cellDate > currentDate;
                          const beforeJoining = cellDate < joiningDate;

                          // Fixed: `employee.attendance` can be undefined per the
                          // EmployeeData type, so `.find` must be called with
                          // optional chaining (this is what caused the build error).
                          const attendanceRecord = employee.attendance?.find((a) => {
                            const d = new Date(a.attendanceDate);
                            return (
                              d.getFullYear() === currentYear &&
                              d.getMonth() === currentMonth &&
                              d.getDate() === date
                            )
                          })

                          let label = isWeekend ? 'H' : '-';

                          const status = attendanceRecord?.status || '-';

                          if (!isFutureDate && !beforeJoining) {
                            label = status == 'present' ? 'P' : status == 'absent' ? 'A' : status == 'onLeave' ? 'L' : isWeekend ? 'H' : 'A';
                          }
                          const cfg = STATUS_CONFIG[label] ?? STATUS_CONFIG["-"];
                          const hasRecord = !isFutureDate && !beforeJoining;

                          return (
                            <td key={day} className="p-1.5 text-center">
                              <button
                                onClick={() => openAttendance(employee._id, employee?.name, date, buildDateForDay(date), label, attendanceRecord)}
                                disabled={!hasRecord}
                                className={`
                              w-8 h-8 rounded-lg text-xs font-bold border
                              flex items-center justify-center mx-auto
                              transition-all duration-150
                              ${cfg.bg} ${cfg.text} ${cfg.border}
                              ${hasRecord ? "hover:scale-110 hover:shadow-sm cursor-pointer" : "cursor-default"}
                            `}
                              >
                                {label}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )
                    : (
                      <tr>
                        <td
                          colSpan={days.length + 1} // +1 for Employee column
                          className="py-10 text-center text-slate-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-10 h-10 text-slate-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5V4H2v16h5m10 0v-4a3 3 0 00-3-3H10a3 3 0 00-3 3v4m10 0H7"
                              />
                            </svg>

                            <p className="font-medium">No employees added.</p>
                            <p className="text-sm text-slate-400">
                              Add employees to start tracking attendance.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
          Drawer — Attendance Details
          ════════════════════════════════════════════════════════════ */}
        {selectedAttendance && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex justify-end z-50"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedAttendance(null); }}
          >
            <div className="w-[420px] bg-white h-full shadow-2xl flex flex-col animate-[slideIn_.2s_ease-out]">

              {/* Drawer header */}
              <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Attendance Details</h3>
                    {/* Fixed: was hardcoded "{day} June 2026" regardless of the actual month/year */}
                    <p className="text-xs text-slate-400">{formatSelectedDate()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAttendance(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="p-5 space-y-5 flex-1 overflow-y-auto">

                {/* Employee + status row */}
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                      {selectedAttendance.employeeName.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{selectedAttendance.employeeName}</p>
                      {/* Fixed: same hardcoded date bug as above */}
                      <p className="text-xs text-slate-400">{formatSelectedDate()}</p>
                    </div>
                  </div>

                  {(() => {
                    const cfg = STATUS_CONFIG[selectedAttendance.status] ?? STATUS_CONFIG["-"];
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Time details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-100 rounded-xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Check In</p>
                    <p className="text-base font-bold text-slate-800">{formattedTime(selectedAttendance.checkIn)?.toUpperCase()}</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Check Out</p>
                    <p className="text-base font-bold text-slate-800">{formattedTime(selectedAttendance.checkOut)?.toUpperCase()}</p>
                  </div>
                </div>

                {/* Working hours */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-emerald-600">
                      <Clock size={16} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Working Hours</p>
                  </div>
                  <p className="text-lg font-extrabold text-emerald-700">{formatWorkingHours(selectedAttendance.workingHours)}</p>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="p-5 border-t border-slate-100">
                <button
                  onClick={handleEditAttendance}
                  className="w-full px-4 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  Edit Attendance
                </button>
              </div>

            </div>
          </div>
        )}

        {open && (
          <Modal
            open={open}
            setForm={setForm}
            mode="edit"
            onClose={handleClose}
            onSubmit={handleSubmit}
            form={form}
          />
        )}

        <style>{`
        @keyframes slideIn {
          from { transform: translateX(24px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      </div>
    </>
  );
}