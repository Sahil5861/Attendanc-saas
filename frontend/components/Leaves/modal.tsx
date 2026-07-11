import CustomDatePicker from "../common/CustomDatePicker";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

export interface Form {
    reason: string;
    daysType: string; // "single" | "multiple"
    type: string;
    status: string;
    date: Date | null;
    fromDate: Date | null;
    toDate: Date | null;
}

interface Props {
    open: boolean;
    form: Form;
    mode?: "create" | "edit";
    setForm: React.Dispatch<React.SetStateAction<Form>>;
    onClose: () => void;
    onSubmit: () => void;
}

export const defaultForm: Form = {
    reason: "",
    daysType: "",
    type: "",
    status: "pending",
    date: null,
    fromDate: null,
    toDate: null,
};

// Helper to safely format a Date | null for <input type="date">
const toDateInputValue = (value: Date | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
};

export default function LeaveModal({
    open,
    form,
    mode,
    setForm,
    onClose,
    onSubmit,
}: Props) {
    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999, padding: "20px 16px",
            }}
        >
            <div style={{
                width: "100%", maxWidth: 540,
                background: "#fff", borderRadius: 20,
                boxShadow: "0 24px 60px rgba(0,0,0,.18)",
                border: "1.5px solid #d1fae5",
            }}>

                {/* Header */}
                <ModalHeader
                    title={mode == 'edit' ? 'Update Leave' : 'Create Leave'}
                    subtitle={mode == 'edit' ? 'Update your leave' : 'Request for a new leave'}
                    onClose={onClose}
                />
                {/* Body */}
                <div style={{ padding: "24px 28px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                        {/* Reason */}
                        <CustomInput
                            label="Reason"
                            value={form.reason}
                            onChange={(e) =>
                                setForm((prev: Form) => ({
                                    ...prev,
                                    reason: e.target.value,
                                }))
                            }
                            placeholder="Enter reason for leave"
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        {/* Leave Type + Days Type */}
                        <CustomSelect
                            label="Leave Type"
                            value={form.type}
                            onChange={(e) =>
                                setForm((prev: Form) => ({
                                    ...prev,
                                    type: e.target.value,
                                }))
                            }
                            options={[
                                { label: "Select Type", value: "" },
                                { label: "Sick Leave", value: "sick" },
                                { label: "Casual Leave", value: "casual" },
                                { label: "Paid Leave", value: "paid" },
                            ]}
                        />

                        <CustomSelect
                            label="Days Type"
                            value={form.daysType}
                            onChange={(e) =>
                                setForm((prev: Form) => ({
                                    ...prev,
                                    daysType: e.target.value,
                                    // reset date fields when switching type
                                    date: null,
                                    fromDate: null,
                                    toDate: null,
                                }))
                            }
                            options={[
                                { label: "Select Days Type", value: "" },
                                { label: "Single Day", value: "single" },
                                { label: "Multiple Days", value: "multiple" },
                            ]}
                        />
                    </div>

                    {form.daysType == 'single' && (

                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                            {/* <CustomInput
                                label="Date"
                                type="date"
                                value={toDateInputValue(form.date)}
                                onChange={(e) =>
                                    setForm((prev: Form) => ({
                                        ...prev,
                                        date: e.target.value
                                            ? new Date(e.target.value)
                                            : null,
                                    }))
                                }
                            /> */}

                            <CustomDatePicker
                            
                                label="Date"
                                value={toDateInputValue(form.date)}
                                onChange={(e) =>
                                    setForm((prev: Form) => ({
                                        ...prev,
                                        date: e.target.value
                                            ? new Date(e.target.value)
                                            : null,
                                    }))
                                }
                                placeholder="Select Date"
                            />
                        </div>
                    )}

                    {form.daysType == 'multiple' && (

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <CustomInput
                                label="From Date"
                                type="date"
                                value={toDateInputValue(form.fromDate)}
                                onChange={(e) =>
                                    setForm((prev: Form) => ({
                                        ...prev,
                                        fromDate: e.target.value
                                            ? new Date(e.target.value)
                                            : null,
                                    }))
                                }
                            />

                            <CustomInput
                                label="To Date"
                                type="date"
                                value={toDateInputValue(form.toDate)}
                                onChange={(e) =>
                                    setForm((prev: Form) => ({
                                        ...prev,
                                        toDate: e.target.value
                                            ? new Date(e.target.value)
                                            : null,
                                    }))
                                }
                            />
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                        <CustomSelect
                            label="Status"
                            value={form.status}                            
                            onChange={(e) =>
                                setForm((prev: Form) => ({
                                    ...prev,
                                    status: e.target.value,
                                }))
                            }
                            options={[
                                { label: "Pending", value: "pending" }
                            ]}
                        />
                    </div>
                </div>
                <ModalFooter
                    onClose={onClose}
                    title={mode == 'edit' ? 'Save Changes' : 'Create'}
                    onSubmit={onSubmit}
                />
            </div>
        </div>
    );
}