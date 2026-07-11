"use client";

import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import FileUpload from "../common/Fileupload";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import CustomDatePicker from "../common/CustomDatePicker";

export interface EmployeeDocument {
    _id: string;
    documentName: string;
    documentType: string;
    documentNumber: string;
    issueDate: string;
    expiryDate: string;
    file: File | string | null;
    fileName?: string;
    originalName?: string;
    mimeType?: string;
    fileSize?: number;
    status?: boolean | string;
}

export const defaultForm: EmployeeDocument = {
    _id: "",
    documentName: "",
    documentType: "",
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    file: null,
};

interface Props {
    open: boolean;
    mode: "create" | "edit";
    form: EmployeeDocument;
    setForm: React.Dispatch<React.SetStateAction<EmployeeDocument>>;
    onClose: () => void;
    onSubmit: () => void;
}

export default function Modal({
    open,
    mode,
    form,
    setForm,
    onClose,
    onSubmit,
}: Props) {

    if (!open) return null;


    const handleFileChange = (items: Array<{ raw?: File; url?: string }>) => {
        const picked = items[0];

        setForm((prev:any) => ({
            ...prev,
            file: picked ? (picked.raw ?? picked.url) : null
        }))
    }

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                padding: "20px 16px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 900,
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 24px 60px rgba(0,0,0,.18)",
                    border: "1.5px solid #d1fae5",
                }}
            >
                <ModalHeader
                    title={mode === "edit" ? "Edit Document" : "Add Document"}
                    subtitle={
                        mode === "edit"
                            ? "Update employee document"
                            : "Add a new employee document"
                    }
                    onClose={onClose}
                />

                {/* body */}
                <div style={{ padding: "24px 28px", maxHeight: 450, overflow:'auto' }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 16,
                        }}
                    >
                        <CustomInput
                            label="Document Name"
                            value={form.documentName}
                            focus
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    documentName: e.target.value,
                                }))
                            }
                            placeholder="e.g. Aadhaar Card"
                        />

                        <CustomSelect
                            label="Document Type"
                            value={form.documentType}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    documentType: e.target.value,
                                }))
                            }
                            options={[
                                { label: "Select Type", value: "" },
                                { label: "Identity Proof", value: "identity" },
                                { label: "Address Proof", value: "address" },
                                { label: "Education", value: "education" },
                                { label: "Experience", value: "experience" },
                                { label: "Other", value: "other" },
                            ]}
                        />

                        <CustomInput
                            label="Document Number"
                            value={form.documentNumber}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    documentNumber: e.target.value,
                                }))
                            }
                            placeholder="Enter document number"
                        />
                        <CustomDatePicker
                            label="Issue Date"
                            value={form.issueDate}
                            placeholder="Select Issue Date"
                            required
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    issueDate: e.target.value,
                                }))
                            }


                        />

                        <CustomDatePicker
                            label="Expriry Date"
                            value={form.expiryDate}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    expiryDate: e.target.value,
                                }))
                            }
                            required
                            placeholder="Select expiry Date"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        <FileUpload
                            label="Upload Files"
                            existingFiles={
                                mode === "edit" && typeof form.file === "string" && form.file
                                    ? [{ id: form._id, name: form.documentName || "document", url: form.file }]
                                    : []
                            }
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <ModalFooter
                    title={mode === "edit" ? "Save Changes" : "Create"}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </div>
        </div>
    );
}
