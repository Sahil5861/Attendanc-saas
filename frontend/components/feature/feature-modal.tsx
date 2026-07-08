import { useState } from "react";
import CustomInput from "../common/CustomInput";
import { features } from "process";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import CustomTextarea from "../common/CustomTextarea";

interface Props {
    open: boolean;
    form: {
        name: string;
        slug: string;
        description: string;
        type: string;
        value?: string | number;
        monthlyPrice?: string | number;
        yearlyPrice?: string | number;
        status: Boolean;
    };
    mode?: "create" | "edit";
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onSubmit: () => void;
}

export default function FeatureModal({
    open,
    form,
    mode,
    setForm,
    onClose,
    onSubmit,
}: Props) {
    if (!open) return null;

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-")      // Spaces -> hyphens
            .replace(/-+/g, "-");      // Multiple hyphens -> single
    };


    const handleChange = (field: string, value: string) => {
        setForm((prev: any) => {
            const updated = {
                ...prev,
                [field]: value,
            };

            // Auto-generate slug when name changes
            if (field === "name") {
                updated.slug = generateSlug(value);
            }

            return updated;
        });
    };

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
            <div style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, border: "1.5px solid #d1fae5", }}>
                <ModalHeader
                    title={mode == 'edit' ? "Edit featute" : "Create Feature"}
                    subtitle='Manage your Plan Features'
                    onClose={onClose}
                />

                <div style={{ padding: "24px 28px" }}>

                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        {/* Feature Name */}
                        <CustomInput
                            label="Feature Name"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Feature Name"
                        />

                        {/* Slug */}
                        <CustomInput
                            label="Slug" value={form.slug} placeholder="feature-slug"
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    slug: e.target.value,
                                }))
                            }
                        />

                    </div>


                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                        <CustomSelect
                            label="Feature Type"
                            value={form.type}
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    type: e.target.value,
                                    value: "",
                                }))
                            }
                            options={[
                                { label: "Select Type", value: "" },
                                { label: "Module Access", value: "module" },
                                { label: "Usage Limit", value: "limit" },
                            ]}
                        />

                        {form.type === "limit" && (
                            <CustomInput
                                label="Limit"
                                type="number"
                                value={form.value ?? ""}
                                placeholder="Enter limit"
                                onChange={((e) => handleChange('value', e.target.value))}
                            />
                        )}

                    </div>



                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 16,
                        }}
                    >



                        {/* Monthly Price */}

                        <CustomInput
                            label="Monthly Price" placeholder="99" type="number"
                            value={form.monthlyPrice}
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    monthlyPrice: Number(e.target.value),
                                }))
                            }

                        />

                        {/* Yearly Price */}

                        <CustomInput
                            label="Annual Price"
                            type="number"
                            value={form.yearlyPrice}
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    yearlyPrice: Number(e.target.value),
                                }))
                            }
                            placeholder="999"
                        />

                        <CustomSelect
                            label="Status"
                            value={form.status ? "true" : "false"}
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    status: e.target.value === "true",
                                }))
                            }

                            options={[
                                { label: 'Active', value: "true" },
                                { label: 'Inactive', value: "false" },
                            ]}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: 16 }}>

                        <CustomTextarea
                            label="Description"
                            rows={2}
                            value={form.description}
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Enter feature description..."

                        />
                    </div>
                </div>

                {/* Footer */}
                <ModalFooter
                    title="Add"
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            </div>
        </div>
    );
}