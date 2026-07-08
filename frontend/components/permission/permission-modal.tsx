import { useState } from "react";
import CustomSelect from "../common/CustomSelect";

interface Props {
    open: boolean;
    form: {
        action: string;
        module: string;
        description: string;
    };
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onSubmit: () => void;
}

export default function PermissionModal({
    open,
    form,
    setForm,
    onClose,
    onSubmit,
}: Props) {
    if (!open) return null;

    const actionTypes = [
        "view",
        "create",
        "edit",
        "delete",
        "update-status",
    ];

    const [modules, setModules] = useState([
        "Attendance",
        "Branch",
        "Company",
        "Employee",
        "Ledger",
        "Permission",
        "Plan",
        "Role",
        "Salary",
    ]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 650,
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 20px 50px rgba(0,0,0,.15)",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        marginBottom: 20,
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#0f172a",
                    }}
                >
                    Add Permission
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                    }}
                >
                    {/* Permission Name */}                  
                    <CustomSelect
                        label="Action Type"
                        value={form.action}
                        onChange={(e) =>
                            setForm((prev: any) => ({
                                ...prev,
                                action: e.target.value,
                            }))
                        }

                        options={[
                            {label: 'Select Action', value: ''},
                            ...actionTypes.map((action) =>(
                                {label: action, value: action}
                            ))
                        ]}
                    />

                    {/* Module */}                    

                    <CustomSelect
                        label="Select Module"
                        value={form.module}
                        onChange={(e) => {
                            setForm((prev:any) => ({
                                ...prev, 
                                module:e.target.value
                            }))
                        }}
                        options={[
                            {label:'Select Module', value: ""},
                            ...modules.map((mod) =>(
                                {label: mod, value:mod}
                            ))
                        ]}
                    />
                </div>

                <div
                    style={{
                        marginTop: 16,
                        padding: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginBottom: 4,
                        }}
                    >
                        Permission Name
                    </div>

                    <div
                        style={{
                            fontWeight: 600,
                            color: "#0f172a",
                        }}
                    >
                        {form.module && form.action
                            ? `${form.module.toLowerCase()}.${form.action}`
                            : "module.action"}
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginTop: 16 }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        Description
                    </label>

                    <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) =>
                            setForm((prev: any) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                        placeholder="Create Company"
                        style={{
                            width: "100%",
                            padding: 12,
                            border: "1px solid #d1d5db",
                            borderRadius: 8,
                            resize: "vertical",
                            outline: "none",
                        }}
                    />
                </div>

                {/* Footer */}
                <div
                    style={{
                        marginTop: 24,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 16px",
                            border: "1px solid #d1d5db",
                            borderRadius: 8,
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onSubmit}
                        style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: 8,
                            background:
                                "linear-gradient(135deg,#059669,#0891b2)",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Save Permission
                    </button>
                </div>
            </div>
        </div>
    );
}