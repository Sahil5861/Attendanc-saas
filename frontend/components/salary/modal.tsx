"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import { getEmployees } from "@/services/branch.service";
import {uid} from "../../constants/helper"

// ── Types ──────────────────────────────────────────────────────────────
export interface SalaryLineItem {
    id: string;
    label: string;
    amount: number;
}

export interface EmployeeSalaryForm {
    employeeId: string;
    basicSalary: number;
    earnings: SalaryLineItem[];     // HRA, conveyance, bonus, etc. — custom add
    deductions: SalaryLineItem[];   // PF, ESI, PT, etc. — custom add
    fines: SalaryLineItem[];        // Late, damage, misconduct, etc. — custom add
    note: string;
}

interface Props {
    open: boolean;
    mode: "create" | "edit";
    form: EmployeeSalaryForm;
    setForm: React.Dispatch<React.SetStateAction<EmployeeSalaryForm>>;
    onClose: () => void;
    onSubmit: () => void;
}

// ── Unique ID helper ───────────────────────────────────────────────────
// const uid = () => Math.random().toString(36).slice(2, 8);

// ── Section divider ────────────────────────────────────────────────────
function SectionLabel({
    title, color = "#6b7280",
}: { title: string; color?: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color,
            }}>
                {title}
            </span>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
        </div>
    );
}



// ── Dynamic line-item list ─────────────────────────────────────────────
function LineItemList({
    items,
    accentColor,
    placeholder,
    presets,
    onChange,
    onAdd,
    onRemove,
}: {
    items: SalaryLineItem[];
    accentColor: string;
    placeholder: string;
    presets: string[];
    onChange: (id: string, field: "label" | "amount", value: any) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.length === 0 && (
                <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                    Nothing added yet. Click "+ Add" to add an item.
                </p>
            )}

            {items.map((item, index) => (
                                
                <div key={index} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* Label — datalist for quick presets */}
                    <div style={{ flex: 2, position: "relative" }}>
                        <input
                            list={`presets-${accentColor}`}
                            placeholder={placeholder}
                            value={item.label}
                            onChange={(e) => onChange(item.id, "label", e.target.value)}
                            style={{
                                width: "100%", padding: "9px 12px", fontSize: 13,
                                border: "1.5px solid #e2e8f0", borderRadius: 10,
                                outline: "none", boxSizing: "border-box",
                                fontFamily: "inherit", color: '#111',
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                        />
                        <datalist id={`presets-${accentColor}`}>
                            {presets.map((p) => <option key={p} value={p} />)}
                        </datalist>
                    </div>

                    {/* Amount */}
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                            fontSize: 13, color: "#9ca3af", pointerEvents: "none",
                        }}>₹</span>
                        <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={item.amount || ""}
                            onChange={(e) => onChange(item.id, "amount", Number(e.target.value))}
                            style={{
                                width: "100%", padding: "9px 12px 9px 24px", fontSize: 13,
                                border: "1.5px solid #e2e8f0", borderRadius: 10,
                                outline: "none", boxSizing: "border-box",
                                fontFamily: "inherit", color: '#111'
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                        />
                    </div>

                    {/* Remove */}
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        style={{
                            width: 32, height: 32, borderRadius: 8, border: "1.5px solid #fee2e2",
                            background: "#fff1f2", color: "#ef4444", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>                
            ))}

            {/* Add row button */}
            <button
                type="button"
                onClick={onAdd}
                style={{
                    alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 600, color: accentColor,
                    background: "transparent", border: `1.5px dashed ${accentColor}40`,
                    borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                    marginTop: 2,
                }}
            >
                <Plus size={13} /> Add
            </button>
        </div>
    );
}


interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    basicSalary: number;
};

// ── Main modal ─────────────────────────────────────────────────────────
export default function EmployeeSalaryModal({ open, mode, form, setForm, onClose, onSubmit, }: Props) {
    if (!open) return null;

    const updateItems = (
        section: "earnings" | "deductions" | "fines",
        id: string,
        field: "label" | "amount",
        value: any
    ) => {
        setForm((prev) => ({
            ...prev,
            [section]: prev[section].map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addItem = (section: "earnings" | "deductions" | "fines") => {
        setForm((prev) => ({
            ...prev,
            [section]: [...prev[section], { id: uid(), label: "", amount: 0 }],
        }));
    };

    const removeItem = (section: "earnings" | "deductions" | "fines", id: string) => {
        setForm((prev) => ({
            ...prev,
            [section]: prev[section].filter((item) => item.id !== id),
        }));
    };


    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);


    const fetchEmployees = async () => {

        setLoading(true);
        const res = await getEmployees();

        console.log('employees : ', res);

        setEmployees(res.data.data);

        setLoading(false);
    }

    useEffect(() => {
        fetchEmployees();
    }, [])




    const handleChangeEmployee = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const employeeId = e.target.value;

        const employee = employees.find(
            (emp) => emp._id === employeeId
        );

        setForm((prev) => ({
            ...prev,
            employeeId,
            basicSalary: employee?.basicSalary ?? 0,
        }));
    };





    // ── Live totals ────────────────────────────────────────────────────
    const totalEarnings =
        Number(form.basicSalary || 0) +
        form.earnings.reduce((s, i) => s + Number(i.amount || 0), 0);

    const totalDeductions =
        form.deductions.reduce((s, i) => s + Number(i.amount || 0), 0);

    const totalFines =
        form.fines.reduce((s, i) => s + Number(i.amount || 0), 0);

    const netSalary = totalEarnings - totalDeductions - totalFines;

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex", justifyContent: "center", alignItems: "center",
                zIndex: 999, padding: "20px 16px", overflowY: "auto",
            }}
        >
            <div style={{
                width: "100%", maxWidth: 580,
                background: "#fff", borderRadius: 20,
                boxShadow: "0 24px 60px rgba(0,0,0,.18)",
                border: "1.5px solid #d1fae5",
                margin: "auto",
            }}>

                {/* Header */}
                <ModalHeader
                    title={mode === "edit" ? "Edit Salary" : "Manage Salary"}
                    subtitle={`Configure earnings, deductions & fines for employees`}
                    onClose={onClose}
                />

                {/* Body */}
                <div style={{ padding: "24px 28px", maxHeight: "68vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>


                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <CustomSelect
                            label="Employee"
                            onChange={handleChangeEmployee}
                            value={form.employeeId}
                            options={[
                                { label: '-Select-', value: '' },

                                ...employees.map((employee: Employee) => (
                                    { label: `${employee.firstName}  ${employee.lastName}`, value: employee._id }
                                ))
                            ]}
                        />

                        <CustomInput
                            label="Basic Salary (₹)"
                            type="number"
                            readonly
                            min={0}
                            placeholder="e.g. 25000"
                            value={form.basicSalary || ""}
                            onChange={(e: any) =>
                                setForm((p) => ({ ...p, basicSalary: Number(e.target.value) }))
                            }
                            required
                        />
                    </div>                

                    {/* ── Earnings ── */}
                    <div>
                        <SectionLabel title="Additional Earnings" color="#059669" />
                        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
                            HRA, conveyance, overtime, incentives, arrears…
                        </p>
                        <LineItemList
                            items={form.earnings}
                            accentColor="#059669"
                            placeholder="e.g. HRA"
                            presets={["HRA", "Conveyance Allowance", "Medical Allowance",
                                "Special Allowance", "Overtime", "Incentive", "Arrears", "Bonus"]}
                            onChange={(id, field, val) => updateItems("earnings", id, field, val)}
                            onAdd={() => addItem("earnings")}
                            onRemove={(id) => removeItem("earnings", id)}
                        />
                    </div>

                    {/* ── Deductions ── */}
                    <div>
                        <SectionLabel title="Deductions" color="#dc2626" />
                        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
                            PF, ESI, professional tax, TDS, loan EMI…
                        </p>
                        <LineItemList
                            items={form.deductions}
                            accentColor="#dc2626"
                            placeholder="e.g. PF"
                            presets={["Provident Fund (PF)", "ESI", "Professional Tax",
                                "TDS", "Loan EMI", "Advance Recovery", "Insurance Premium"]}
                            onChange={(id, field, val) => updateItems("deductions", id, field, val)}
                            onAdd={() => addItem("deductions")}
                            onRemove={(id) => removeItem("deductions", id)}
                        />
                    </div>

                    {/* ── Note ── */}
                    <div>
                        <label style={{
                            fontSize: 12, fontWeight: 600, color: "#374151",
                            display: "block", marginBottom: 6
                        }}>
                            Note <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Any remarks for this salary record…"
                            value={form.note}
                            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                            style={{
                                width: "100%", padding: "10px 12px", fontSize: 13,
                                border: "1.5px solid #e2e8f0", borderRadius: 10,
                                resize: "vertical", outline: "none", fontFamily: "inherit",
                                boxSizing: "border-box", color: '#111'
                            }}
                        />
                    </div>

                    {/* ── Live summary ── */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 10, background: "#f8fafc", borderRadius: 14,
                        padding: 16, border: "1px solid #e2e8f0",
                    }}>
                        {[
                            { label: "Gross", value: totalEarnings, color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" },
                            { label: "Deductions", value: totalDeductions, color: "#991b1b", bg: "#fff1f2", border: "#fecaca" },
                            { label: "Fines", value: totalFines, color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
                            {
                                label: "Net Salary", value: netSalary, color: netSalary >= 0 ? "#1e40af" : "#c2410c",
                                bg: netSalary >= 0 ? "#eff6ff" : "#fff7ed",
                                border: netSalary >= 0 ? "#bfdbfe" : "#fed7aa"
                            },
                        ].map((s) => (
                            <div key={s.label} style={{
                                background: s.bg, border: `1px solid ${s.border}`,
                                borderRadius: 10, padding: "10px 12px",
                            }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 700, color: "#6b7280",
                                    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5
                                }}>
                                    {s.label}
                                </p>
                                <p style={{ fontSize: 16, fontWeight: 800, color: s.color }}>
                                    ₹{Number(s.value).toLocaleString("en-IN")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <ModalFooter
                    title={mode === "edit" ? "Save Changes" : "Save Salary"}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </div>
        </div>
    );
}

// ── Default form value (use in parent page) ────────────────────────────
export const defaultSalaryForm: EmployeeSalaryForm = {   
    employeeId: '', 
    basicSalary: 0,
    earnings: [],
    deductions: [],
    fines: [],
    note: "",
};