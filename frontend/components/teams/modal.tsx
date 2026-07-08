"use client";

import { useState } from "react";

import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import SearchInput from "../common/SearchInput";
import MultiSelect from "../common/CustomMultiSelect";
import CustomMultiSelect from "../common/CustomMultiSelect";


export interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation?: {
        _id: string;
        title: string;
    };
    department?: {
        _id: string;
        title: string;
    };
}

interface Props {
    open: boolean;
    mode: "create" | "edit";
    employees: Employee[];
    form: {
        title: string;
        slug: string;
        teamLead : string;
        status: string | boolean;
        employeeIds: string[];
    };
    setForm: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onSubmit: () => void;
}

export default function Modal({ open, mode, employees, form, setForm, onClose, onSubmit }: Props) {
    if (!open) return null;

    const [search, setSearch] = useState("");

    console.log("Employees in modal:", employees);

    const generateSlug = (text: string) => {
        return text.toLocaleLowerCase().trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    const filteredEmployees = employees.filter((emp) =>
        `${emp.firstName} ${emp.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const toggleEmployee = (id: string) => {
        setForm((prev: any) => ({
            ...prev,
            employeeIds: prev.employeeIds.includes(id)
                ? prev.employeeIds.filter((x: string) => x !== id)
                : [...prev.employeeIds, id],
        }));
    };

    const employeeOptions = employees.map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName}`,
        subtitle: `${emp.designation?.title ?? ""} • ${emp.email}`,
    }));

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
                    title={mode === "edit" ? "Edit Team" : "Create Team"}
                    onClose={onClose}
                    subtitle={mode === "edit" ? "Update team details" : "Add a new team for this branch"}
                />
                {/* Body */}
                <div style={{ padding: "24px 28px" }}>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                        <CustomInput
                            label="Team Name"
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

                        {/* <CustomInput
                            label="Team Lead"
                            type="text"
                            value={form.teamLead}
                            placeholder="e.g. Rahul sharma"
                        /> */}

                        <CustomSelect
                            label="Team Lead"
                            value={form.teamLead}
                            onChange={(e) =>
                                setForm((prev: any) => ({
                                    ...prev,
                                    teamLead: e.target.value,
                                }))
                            }
                            options={[
                                {label: '-Select-', value: ''},
                                ...employees.map((employee) => (
                                    {label: `${employee.firstName} ${employee.lastName}`, value: `${employee.firstName} ${employee.lastName}`}
                                ))
                            ]}
                        />

                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                        <div style={{ marginTop: 20 }}>

                            {/* <label className="block text-sm font-medium mb-2">
                                Assign Employees
                            </label>
                            <SearchInput
                                width='100%'
                                value={search}
                                placeholder="Search employees..."
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <div
                                className="border rounded-xl overflow-auto"
                                style={{ maxHeight: 220, marginTop: '10px', borderColor: '#ddd' }}
                            >
                                {filteredEmployees.map((emp) => {

                                    const checked = form.employeeIds.includes(emp._id);

                                    return (
                                        <label
                                            key={emp._id}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer" style={{borderBottom: '1px',borderColor:'#ddd'}}
                                        >
                                            <div className="flex items-center gap-3">

                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleEmployee(emp._id)}
                                                />

                                                <div>

                                                    <div className="font-medium">
                                                        {emp.firstName} {emp.lastName}
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {emp.designation.title} | {emp.email}
                                                    </div>

                                                </div>

                                            </div>

                                        </label>
                                    );
                                })}
                            </div> */}

                            <CustomMultiSelect
                                label="Assign Employees"
                                placeholder="Search employees..."
                                options={employeeOptions}
                                value={form.employeeIds}
                                onChange={(ids) =>
                                    setForm((prev: any) => ({
                                        ...prev,
                                        employeeIds: ids,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>


                        <CustomSelect
                            label="Status"
                            value={form.status}
                            onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
                            options={[
                                { label: 'Active', value: true },
                                { label: 'Inactive', value: false },
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