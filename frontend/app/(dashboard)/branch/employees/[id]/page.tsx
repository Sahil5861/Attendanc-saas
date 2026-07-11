"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Cake,
    Briefcase,
    Building2,
    CalendarDays,
    IndianRupee,
    Clock,
    ShieldCheck,
    ShieldOff,
    User,
    Power,
    MapPinned,
    Loader2,
    File,
} from "lucide-react";
import Button from "@/components/common/Button";
import { getEmployeeById, updateEmployeeStatus } from "@/services/branch.service"; // ⚠️ adjust `updateEmployeeStatus` to your actual update endpoint function
import { getCityById, getStateById } from "@/services/super-admin.service";

interface Employee {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;

    designation?: {
        _id: string;
        title: string;
    };
    department?: {
        _id: string;
        title: string;
    };
    joiningDate: string;
    employmentType: string;

    basicSalary: number;
    salaryType: string;

    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;

    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;

    password: string;
    isLoginEnabled: boolean;
    siteCheckinEnabled: boolean; // ⚠️ new field — add this to your Employee schema if it doesn't already exist
    status: boolean;
}

interface LookupItem {
    _id: string;
    name: string;
}

function formatDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

type ToggleField = "status" | "isLoginEnabled" | "siteCheckinEnabled";

export default function EmployeeViewPage() {
    const params = useParams();
    const router = useRouter();
    const employeeId = params.id as string;

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    const [state, setState] = useState<LookupItem | null>(null);
    const [city, setCity] = useState<LookupItem | null>(null);

    const [updatingField, setUpdatingField] = useState<ToggleField | null>(null);

    useEffect(() => {
        fetchEmployee();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    const fetchEmployee = async () => {
        try {
            setLoading(true);

            const res = await getEmployeeById(employeeId);
            const emp = res.data.data;

            setEmployee(emp);

            const [stateRes, cityRes] = await Promise.all([
                emp?.state ? getStateById(emp.state) : Promise.resolve(null),
                emp?.city ? getCityById(emp.city) : Promise.resolve(null),
            ]);

            if (stateRes) setState(stateRes.data.data);
            if (cityRes) setCity(cityRes.data.data);
        } catch {
            toast.error("Failed to load employee details");
        } finally {
            setLoading(false);
        }
    };

    // Handles all 3 toggles (status / login access / site check-in) the same way
    const handleToggle = async (field: ToggleField, currentValue: boolean) => {
        if (!employee || updatingField) return;

        const nextValue = !currentValue;


        

        try {
            setUpdatingField(field);
            const res = await updateEmployeeStatus(employeeId, { [field]: nextValue });

            if (res?.data?.success) {
                setEmployee((prev) => (prev ? { ...prev, [field]: nextValue } : prev));
                toast.success(res.data.message || "Updated successfully");
            } else {
                toast.error(res?.data?.message || "Failed to update");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, please try again");
        } finally {
            setUpdatingField(null);
        }
    };

    const isActive = employee?.status === true;
    const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "";

    return (
        <div className="pb-10">
            {/* Back button */}
            <Button
                title="Back"
                type="success"
                outline
                onClick={() => router.back()}
                icon={<ArrowLeft size={16} />}
            />

            {loading ? (
                <div className="mt-7 space-y-4">
                    <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                </div>
            ) : !employee ? (
                <div className="mt-10 text-center text-sm text-slate-400">
                    Employee not found.
                </div>
            ) : (
                <>
                    {/* Profile header card */}
                    <div className="mt-7 mb-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-emerald-100 bg-white p-7 shadow-[0_4px_24px_rgba(16,185,129,0.06)]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-2xl font-extrabold text-emerald-800">
                                {fullName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-xl font-extrabold text-slate-900">{fullName}</h1>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                            isActive
                                                ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                                : "border-red-300 bg-red-50 text-red-600"
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isActive ? "bg-emerald-600" : "bg-red-600"
                                            }`}
                                        />
                                        {isActive ? "Active" : "Deactive"}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    {employee.designation?.title || "—"}
                                    {employee.department?.title ? ` · ${employee.department.title}` : ""}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                            <InfoItem icon={<Mail size={13} />} label="Email" value={employee.email} />
                            <InfoItem icon={<Phone size={13} />} label="Phone" value={employee.phone} mono />
                        </div>
                    </div>

                    {/* ── Basic Details ── */}
                    <SectionGroup title="Basic Details">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <SectionCard icon={<User size={17} />} title="Personal Details">
                                <InfoItem icon={<Mail size={13} />} label="Email" value={employee.email} />
                                <InfoItem icon={<Phone size={13} />} label="Phone" value={employee.phone} mono />
                                <InfoItem icon={<User size={13} />} label="Gender" value={employee.gender} />
                                <InfoItem
                                    icon={<Cake size={13} />}
                                    label="Date of Birth"
                                    value={formatDate(employee.dateOfBirth)}
                                />
                            </SectionCard>

                            <SectionCard icon={<Briefcase size={17} />} title="Employment Details">
                                <InfoItem
                                    icon={<Briefcase size={13} />}
                                    label="Designation"
                                    value={employee.designation?.title}
                                />
                                <InfoItem
                                    icon={<Building2 size={13} />}
                                    label="Department"
                                    value={employee.department?.title}
                                />
                                <InfoItem
                                    icon={<CalendarDays size={13} />}
                                    label="Joining Date"
                                    value={formatDate(employee.joiningDate)}
                                />
                                <InfoItem
                                    icon={<Briefcase size={13} />}
                                    label="Employment Type"
                                    value={employee.employmentType}
                                />
                            </SectionCard>

                            <SectionCard icon={<IndianRupee size={17} />} title="Salary Details">
                                <InfoItem
                                    icon={<IndianRupee size={13} />}
                                    label="Basic Salary"
                                    value={
                                        employee.basicSalary != null
                                            ? `₹${employee.basicSalary.toLocaleString("en-IN")}`
                                            : "—"
                                    }
                                />
                                <InfoItem icon={<Clock size={13} />} label="Salary Type" value={employee.salaryType} />
                            </SectionCard>

                            <SectionCard icon={<Clock size={17} />} title="Shift Details">
                                <InfoItem icon={<Clock size={13} />} label="Shift Name" value={employee.shiftName} />
                                <InfoItem
                                    icon={<Clock size={13} />}
                                    label="Shift Timing"
                                    value={
                                        employee.shiftStartTime && employee.shiftEndTime
                                            ? `${employee.shiftStartTime} – ${employee.shiftEndTime}`
                                            : "—"
                                    }
                                    mono
                                />
                            </SectionCard>
                        </div>
                    </SectionGroup>

                    {/* ── Address & Location ── */}
                    <SectionGroup title="Address & Location">
                        <SectionCard icon={<MapPin size={17} />} title="Address">
                            <InfoItem icon={<MapPin size={13} />} label="Address" value={employee.address} />
                            <InfoItem icon={<MapPin size={13} />} label="City" value={city?.name} />
                            <InfoItem icon={<MapPin size={13} />} label="State" value={state?.name} />
                            <InfoItem icon={<MapPin size={13} />} label="Country" value={employee.country} />
                            <InfoItem icon={<MapPin size={13} />} label="Pincode" value={employee.pincode} mono />
                        </SectionCard>
                    </SectionGroup>



                    {/* Documents */}

                    {/* ── Status & Access Controls ── */}
                    <SectionGroup title="Status & Access">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <ToggleRow
                                icon={<Power size={16} />}
                                label="Account Status"
                                description="Active employees can be scheduled and marked present"
                                checked={employee.status === true}
                                loading={updatingField === "status"}
                                onToggle={() => handleToggle("status", employee.status)}
                            />
                            <ToggleRow
                                icon={employee.isLoginEnabled ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                                label="Login Access"
                                description="Allow this employee to log in to their account"
                                checked={employee.isLoginEnabled === true}
                                loading={updatingField === "isLoginEnabled"}
                                onToggle={() => handleToggle("isLoginEnabled", employee.isLoginEnabled)}
                            />
                            <ToggleRow
                                icon={<MapPinned size={16} />}
                                label="Site Check-in"
                                description="Allow this employee to check in/out from the branch location"
                                checked={employee.siteCheckinEnabled === true}
                                loading={updatingField === "siteCheckinEnabled"}
                                onToggle={() => handleToggle("siteCheckinEnabled", employee.siteCheckinEnabled)}
                                isLast
                            />
                        </div>
                    </SectionGroup>
                </>
            )}
        </div>
    );
}

// ── Helper components ──

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h2>
            {children}
        </div>
    );
}

function SectionCard({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                    {icon}
                </span>
                <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
    link,
    mono,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    link?: string;
    mono?: boolean;
}) {
    const content = (
        <p
            className={`m-0 text-sm font-semibold ${link ? "text-cyan-600" : "text-slate-900"} ${
                mono ? "font-mono" : ""
            }`}
        >
            {value || "—"}
        </p>
    );

    return (
        <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {icon}
                {label}
            </p>
            {link ? (
                <a href={link} className="no-underline">
                    {content}
                </a>
            ) : (
                content
            )}
        </div>
    );
}

function ToggleRow({
    icon,
    label,
    description,
    checked,
    loading,
    onToggle,
    isLast,
}: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    checked: boolean;
    loading?: boolean;
    onToggle: () => void;
    isLast?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 py-4 ${
                isLast ? "" : "border-b border-slate-100"
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
                </div>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={loading}
                onClick={onToggle}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    checked ? "bg-emerald-500" : "bg-slate-300"
                }`}
            >
                {loading ? (
                    <Loader2
                        size={12}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white"
                    />
                ) : (
                    <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            checked ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                )}
            </button>
        </div>
    );
}