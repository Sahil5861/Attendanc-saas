"use client";

import CustomDatePicker from "../common/CustomDatePicker";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import CustomTextarea from "../common/CustomTextarea";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import { Branch, Holiday } from "../interface";

interface Props {
    open: boolean;
    mode: "create" | "edit";
    form: Holiday;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onSubmit: () => void;
    branches?: Branch[]; // optional list, used only when appliesToAllBranches is false
}

export const defaultForm = {
    _id: "",
    companyId: "",

    title: "",
    slug: "",
    description: "",

    type: "national", // national | festival | custom

    date: "", // YYYY-MM-DD

    isPaid: true,

    isOptional: false,

    appliesToAllBranches: true,

    branchIds: [], // agar selected branches ke liye holiday ho

    isRecurring: true, // har saal same date par

    status: "active", // active | inactive

    createdBy: "",

    notes: "",
};

export default function Modal({ open, mode, form, setForm, onClose, onSubmit, branches = [] }: Props) {
    if (!open) return null;

    const update = (patch: Partial<typeof form>) =>
        setForm((prev: any) => ({ ...prev, ...patch }));

    const toggleBranch = (branchId: string) => {
        setForm((prev: any) => {
            const exists = prev.branchIds.includes(branchId);
            return {
                ...prev,
                branchIds: exists
                    ? prev.branchIds.filter((id: string) => id !== branchId)
                    : [...prev.branchIds, branchId],
            };
        });
    };

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex", justifyContent: "center", alignItems: "center",
                zIndex: 999, padding: "20px 16px",
            }}
        >
            <div style={{
                width: "100%", maxWidth: 560,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#fff", borderRadius: 20,
                boxShadow: "0 24px 60px rgba(0,0,0,.18)",
                border: "1.5px solid #d1fae5",
            }}>

                {/* Header */}
                <ModalHeader
                    title={mode === "edit" ? "Edit Holiday" : "Add Holiday"}
                    onClose={onClose}
                    subtitle={mode === "edit" ? "Update holiday details" : "Add a new holiday for your branches"}
                />

                {/* Body */}
                <div style={{ padding: "24px 28px", maxHeight: 450, overflow: 'auto' }}>
                    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <CustomInput
                                    label="Holiday Title"
                                    type="text"
                                    value={form.title}
                                    focus
                                    onChange={(e) => update({ title: e.target.value })}
                                    placeholder="e.g. Diwali"
                                />
                            </div>

                            <CustomSelect
                                label="Type"
                                value={form.type}
                                onChange={(e) => update({ type: e.target.value })}
                                options={[
                                    { label: "National", value: "national" },
                                    { label: "Festival", value: "festival" },
                                    { label: "Custom", value: "custom" },
                                ]}
                            />

                            {/* <CustomInput
                                label="Date"
                                type="date"
                                value={form.date}
                                onChange={(e) => update({ date: e.target.value })}
                            /> */}
                            <CustomDatePicker
                                label="Date"
                                placeholder="Select Date"                            
                                value={form.date}
                                onChange={(e) => update({ date: e.target.value })}
                            />

                            <CustomSelect
                                label="Paid / Unpaid"
                                value={form.isPaid}
                                onChange={(e) => update({ isPaid: e.target.value === "true" || e.target.value === true })}
                                options={[
                                    { label: "Paid", value: true },
                                    { label: "Unpaid", value: false },
                                ]}
                            />

                            <CustomSelect
                                label="Optional"
                                value={form.isOptional}
                                onChange={(e) => update({ isOptional: e.target.value === "true" || e.target.value === true })}
                                options={[
                                    { label: "Mandatory", value: false },
                                    { label: "Optional", value: true },
                                ]}
                            />

                            <CustomSelect
                                label="Recurring Yearly"
                                value={form.isRecurring}
                                onChange={(e) => update({ isRecurring: e.target.value === "true" || e.target.value === true })}
                                options={[
                                    { label: "Yes, every year", value: true },
                                    { label: "No, one-time", value: false },
                                ]}
                            />

                            <CustomSelect
                                label="Status"
                                value={form.status}
                                onChange={(e) => update({ status: e.target.value })}
                                options={[
                                    { label: "Active", value: "active" },
                                    { label: "Inactive", value: "inactive" },
                                ]}
                            />

                            <CustomSelect
                                label="Applies To"
                                value={form.appliesToAllBranches}
                                onChange={(e) => update({
                                    appliesToAllBranches: e.target.value === "true" || e.target.value === true,
                                    branchIds: (e.target.value === "true" || e.target.value === true) ? [] : form.branchIds,
                                })}
                                options={[
                                    { label: "All Branches", value: true },
                                    { label: "Selected Branches", value: false },
                                ]}
                            />

                            {!form.appliesToAllBranches && (
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#065f46", marginBottom: 6, display: "block" }}>
                                        Select Branches
                                    </label>
                                    <div style={{
                                        display: "flex", flexWrap: "wrap", gap: 8,
                                        border: "1.5px solid #d1fae5", borderRadius: 12, padding: 10,
                                    }}>
                                        {branches.length === 0 ? (
                                            <span style={{ fontSize: 13, color: "#6b7280" }}>No branches available</span>
                                        ) : (
                                            branches.map((b) => {
                                                const selected = form.branchIds.includes(b._id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={b._id}
                                                        onClick={() => toggleBranch(b._id)}
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderRadius: 999,
                                                            border: selected ? "1.5px solid #059669" : "1.5px solid #d1d5db",
                                                            background: selected ? "#d1fae5" : "#fff",
                                                            color: selected ? "#065f46" : "#374151",
                                                            fontSize: 13,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {b.branchName}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ gridColumn: "1 / -1" }}>
                                {/* <label style={{ fontSize: 13, fontWeight: 600, color: "#065f46", marginBottom: 6, display: "block" }}>
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => update({ description: e.target.value })}
                                    placeholder="Short description of the holiday"
                                    rows={2}
                                    style={{
                                        width: "100%", borderRadius: 12, border: "1.5px solid #d1fae5",
                                        padding: "10px 12px", fontSize: 14, resize: "vertical",
                                    }}
                                /> */}

                                <CustomTextarea
                                    label="Description"
                                    value={form.description}
                                    onChange={(e) => update({ description: e.target.value })}
                                    placeholder="Short description of the holiday"
                                    rows={2}
                                />
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                {/* <label style={{ fontSize: 13, fontWeight: 600, color: "#065f46", marginBottom: 6, display: "block" }}>
                                    Notes
                                </label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => update({ notes: e.target.value })}
                                    placeholder="Any internal notes"
                                    rows={2}
                                    style={{
                                        width: "100%", borderRadius: 12, border: "1.5px solid #d1fae5",
                                        padding: "10px 12px", fontSize: 14, resize: "vertical",
                                    }}
                                /> */}

                                <CustomTextarea
                                    label="Notes"
                                    value={form.notes}
                                    onChange={(e) => update({ notes: e.target.value })}
                                    placeholder="Any internal notes"
                                    rows={2}
                                />
                            </div>
                        </div>

                    </form>
                </div>
                {/* Footer */}
                <ModalFooter
                    title={mode === "edit" ? "Save Changes" : "Create"}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </div>
        </div>
    );
}