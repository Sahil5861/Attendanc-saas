"use client";

import { useEffect, useState } from "react";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import { getCitiesByState, getStates } from "@/services/super-admin.service";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import { fromJSONSchema } from "zod";

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

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);

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
                    title={mode === "edit" ? "Edit Designation" : "Add Designation"}
                    onClose={onClose}
                    subtitle={mode === "edit" ? "Update designation details" : "Add a new designation for this branch"}
                />
                {/* Body */}
                <div style={{ padding: "24px 28px" }}>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                        <CustomInput
                            label="Designation Name"
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
                            // onChange={(e) =>                                
                            //     setForm((prev: any) => ({
                            //     ...prev,
                            //     slug: e.target.value,
                            //     }))
                            // }
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