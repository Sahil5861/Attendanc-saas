"use client";

import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

interface Props {
    open: boolean;
    mode: "create" | "edit";
    form: {
        title: string;  
        slug: string;  
        status: string | boolean;  
    };
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onSubmit: () => void;
}

export default function Modal({ open, mode, form, setForm, onClose, onSubmit }: Props) {
    if (!open) return null;


    const generateSlug = (text:string)=>{
        return text.toLocaleLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

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
                width: "100%", maxWidth: 540,
                background: "#fff", borderRadius: 20,
                boxShadow: "0 24px 60px rgba(0,0,0,.18)",
                border: "1.5px solid #d1fae5",
            }}>

                {/* Header */}
                <ModalHeader
                    title={mode === "edit" ? "Edit Departments" : "Add Departments"}
                    onClose={onClose}
                    subtitle={mode === "edit" ? "Update designation details" : "Add a new designation for this branch"}
                />
                {/* Body */}
                <div style={{ padding: "24px 28px" }}>

                    <form onSubmit={onSubmit} method="post"></form>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                        <CustomInput
                            label="Departments Name"
                            type="text"
                            value={form.title}
                            focus
                            onChange={(e) => {
                                const title = e.target.value;

                                setForm((prev: any) => ({
                                ...prev,
                                title,
                                slug: generateSlug(title),
                                }));
                            }}
                            placeholder="e.g. Accounting"
                        />
                        <CustomInput
                            label="Slug"
                            type="text"
                            value={form.slug}
                            readonly                          
                            placeholder="e.g. accounting"
                        />


                        <CustomSelect
                            label="Status"
                            value={form.status}
                            onChange={(e) => setForm((p:any) => ({...p, status: e.target.value}))}
                            options={[
                                {label: 'Active', value: true},
                                {label: 'Inactive', value: false},
                            ]}
                        />
                    </div>
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