"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Loader2,
    IndianRupee,
    CalendarDays,
    CheckCircle2,
    XCircle,
    CalendarX2,
    Clock3,
} from "lucide-react";
import toast from "react-hot-toast";

import { getEmployeeAttendance } from "@/services/branch.service";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

import {Employee} from './employee-table';


// interface Employee {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     designation?: string | { title?: string };
//     basicSalary: number;
//     salaryType: string; // "monthly" | "daily" | "hourly"
// }



interface AttendanceRecord {
    _id: string;
    employeeId: string;
    branchId: string;
    attendanceDate: string;
    checkin?: string;
    checkout?: string;
    status: "present" | "absent" | "half-day" | "leave" | string;
    workingHours: number;
    remarks?: string;
    isAutoCheckout?: boolean;
}

interface SalaryModalProps {
    open: boolean;
    employee: Employee;
    onClose: () => void;
}

// How much a day "counts" towards payable days, per attendance status.
// Adjust these weights to match your company's payroll policy.
const STATUS_WEIGHT: Record<string, number> = {
    present: 1,
    "half-day": 0.5,
    leave: 1, // treated as paid leave by default
    absent: 0,
};

function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}

function getDesignationLabel(designation: Employee["designation"]) {
    if (!designation) return "";
    if (typeof designation === "string") return designation;
    return designation.name || "";
}

export default function SalaryModal({
    open,
    employee,
    onClose,
}: SalaryModalProps) {
    const today = new Date();

    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
    const [year, setYear] = useState(today.getFullYear());
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await getEmployeeAttendance(employee._id, month, year);

            if (response?.data?.success) {
                setAttendance(response.data.data || []);
            } else {
                setAttendance([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load attendance");
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open || !employee?._id) return;
        fetchAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, employee?._id, month, year]);

    const summary = useMemo(() => {
        const totalDays = daysInMonth(month, year);

        const counts = {
            present: 0,
            absent: 0,
            "half-day": 0,
            leave: 0,
            other: 0,
        };

        let totalWorkingHours = 0;
        let payableDays = 0;


        console.log('attendance : ', attendance);
        

        for (const record of attendance) {
            totalWorkingHours += record.workingHours || 0;

            const status = record.status?.toLowerCase();
            if (status in counts) {
                counts[status as keyof typeof counts] += 1;
            } else {
                counts.other += 1;
            }

            payableDays += STATUS_WEIGHT[status] ?? 0;
        }

        const basicSalary = employee.basicSalary || 0;
        const salaryType = (employee.salaryType || "monthly").toLowerCase();

        let perDayRate = 0;
        let netSalary = 0;

        if (salaryType === "monthly") {
            perDayRate = basicSalary / totalDays;
            netSalary = perDayRate * payableDays;
        } else if (salaryType === "daily") {
            perDayRate = basicSalary;
            netSalary = basicSalary * payableDays;
        } else if (salaryType === "hourly") {
            netSalary = basicSalary * totalWorkingHours;
        } else {
            // fallback: treat unknown types like monthly
            perDayRate = basicSalary / totalDays;
            netSalary = perDayRate * payableDays;
        }

        // const deduction = salaryType === "hourly" ? 0 : Math.max(basicSalary - netSalary, 0);
        const deduction = salaryType === "hourly" ? 0 : (counts.absent * perDayRate + counts["half-day"] * (perDayRate / 2));

        return {
            totalDays,
            counts,
            totalWorkingHours,
            payableDays,
            perDayRate,
            netSalary,
            deduction,
            salaryType,
            basicSalary,
        };
    }, [attendance, employee.basicSalary, employee.salaryType, month, year]);

    const formatWorkingHours = (hours: number) => {
        const hrs = Math.floor(hours);
        const mins = Math.round((hours - hrs) * 60);

        if (hrs === 0) return `${mins} mins`;
        if (mins === 0) return `${hrs} hrs`;

        return `${hrs} hrs ${mins} mins`;
    };

    if (!open) return null;

    const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", {
        month: "long",
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header (existing ModalHeader component — designation bug fixed via getDesignationLabel) */}
                <ModalHeader
                    title={`${employee.firstName} ${employee.lastName}`}
                    subtitle={getDesignationLabel(employee.designation) || ""}
                    onClose={onClose}
                />

                {/* Month selector */}
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-6 py-3">
                    <CalendarDays size={16} className="text-slate-400 shrink-0" />
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>
                                {new Date(2000, m - 1, 1).toLocaleString("default", {
                                    month: "long",
                                })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400"
                    >
                        {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(
                            (y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-slate-500">
                            <Loader2 size={22} className="animate-spin text-emerald-600" />
                            Loading attendance for {monthLabel} {year}...
                        </div>
                    ) : (
                        <>
                            {/* Attendance summary */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <SummaryCard
                                    label="Present"
                                    value={summary.counts.present}
                                    icon={<CheckCircle2 size={18} />}
                                    bg="bg-emerald-50"
                                    ring="border-emerald-100"
                                    text="text-emerald-600"
                                />

                                <SummaryCard
                                    label="Absent"
                                    value={summary.counts.absent}
                                    icon={<XCircle size={18} />}
                                    bg="bg-red-50"
                                    ring="border-red-100"
                                    text="text-red-600"
                                />

                                <SummaryCard
                                    label="Half Day"
                                    value={summary.counts["half-day"]}
                                    icon={<Clock3 size={18} />}
                                    bg="bg-amber-50"
                                    ring="border-amber-100"
                                    text="text-amber-600"
                                />

                                <SummaryCard
                                    label="Leave"
                                    value={summary.counts.leave}
                                    icon={<CalendarX2 size={18} />}
                                    bg="bg-blue-50"
                                    ring="border-blue-100"
                                    text="text-blue-600"
                                />
                            </div>

                            <div className="mt-4 mb-5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
                                <span>Total working hours</span>
                                <span className="font-semibold text-slate-900">
                                    {formatWorkingHours(summary.totalWorkingHours)}
                                </span>
                            </div>

                            {/* Salary breakdown */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Salary breakdown &middot; {summary.salaryType}
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <Row label="Basic salary" value={formatCurrency(summary.basicSalary)} />
                                    {summary.salaryType !== "hourly" && (
                                        <>
                                            <Row label="Days in month" value={String(summary.totalDays)} />
                                            <Row label="Payable days" value={summary.payableDays.toString()} />
                                            <Row
                                                label="Per day rate"
                                                value={formatCurrency(summary.perDayRate)}
                                            />
                                            <Row
                                                label="Deduction (absent days)"
                                                value={formatCurrency(summary.deduction)}
                                                valueClass="text-red-500"
                                            />
                                        </>
                                    )}
                                    {summary.salaryType === "hourly" && (
                                        <Row
                                            label="Rate per hour"
                                            value={formatCurrency(summary.basicSalary)}
                                        />
                                    )}
                                    <div className="flex items-center justify-between bg-emerald-50/60 px-4 py-3.5">
                                        <span className="text-sm font-bold text-slate-800">
                                            Net payable
                                        </span>
                                        <span className="flex items-center gap-1 text-lg font-extrabold text-emerald-700">
                                            <IndianRupee size={17} />
                                            {summary.netSalary.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {attendance.length === 0 && (
                                <p className="mt-3 text-center text-xs text-slate-400">
                                    No attendance records found for {monthLabel} {year}.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <ModalFooter onClose={onClose} />
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    bg,
    ring,
    text,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    bg: string;
    ring: string;
    text: string;
}) {
    return (
        <div className={`rounded-xl border ${ring} ${bg} px-3 py-3 flex flex-col items-center gap-1.5 text-center`}>
            <span className={text}>{icon}</span>
            <span className={`text-xl font-extrabold ${text}`}>{value}</span>
            <span className="text-[11px] font-medium text-slate-500">{label}</span>
        </div>
    );
}

function Row({
    label,
    value,
    valueClass = "text-slate-900",
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className={`font-semibold ${valueClass}`}>{value}</span>
        </div>
    );
}

function formatCurrency(value: number) {
    return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}