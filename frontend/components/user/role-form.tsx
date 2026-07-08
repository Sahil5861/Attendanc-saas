"use client";

import { useState, useEffect } from "react";

import { createCompany, updateCompany } from "@/services/super-admin.service";
import toast from "react-hot-toast";

interface Props {
    mode?: "create" | "edit";
    company?: any;
    onClose?: () => void;
    onSuccess?: ()=> void;
}

export default function Form({
    mode = "create",
    company,
    onClose,
    onSuccess
}: Props) {

    const [loading, setLoading] = useState(false);

    const [sameAsOwner, setSameAsOwner] = useState(false);

    useEffect(() => {
        if (!company) {
            return;   
        }

        setForm({
            companyName: company.companyName || "",

            companyCode:
                company.companyCode || "",

            ownerName:
                company.ownerName || "",

            email:
                company.email || "",

            phone:
                company.phone || "",

            gstNumber:
                company.gst || "",

            address:
                company.address || "",

            adminName:
                company.adminName || "",

            adminEmail:
                company.adminEmail || "",

            adminPhone:
                company.adminPhone || "",

            password: "",
            confirmPassword: "",

        });
    }, [company]);

    const [form, setForm] = useState({

        companyName: "",
        companyCode: "",

        ownerName: "",
        email: "",
        phone: "",

        gstNumber: "",

        address: "",

        adminName: "",
        adminEmail: "",
        adminPhone: "",

        password: "",
        confirmPassword: "",
    });

    const handleSameAsOwner = (
        checked: boolean
    ) => {

        setSameAsOwner(checked);

        if (checked) {

            setForm(prev => ({
                ...prev,

                adminName:
                    prev.ownerName,

                adminEmail:
                    prev.email,

                adminPhone:
                    prev.phone,
            }));

        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement
        >
    ) => {

        setForm({
            ...form,
            [e.target.name]:
                e.target.value,
        });
    };

    const resetForm = () => {
        setForm({
            companyName: "",
            companyCode: "",

            ownerName: "",
            email: "",
            phone: "",

            gstNumber: "",
            address: "",

            adminName: "",
            adminEmail: "",
            adminPhone: "",

            password: "",
            confirmPassword: "",
        });

        setSameAsOwner(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        try {
            if (mode == 'create') {                
                if (form.password !== form.confirmPassword) {
                    toast.error("Password do not match");
    
                    return;
                }
            }

            setLoading(true);

            const payload = {
                companyName: form.companyName,

                companyCode: form.companyCode,

                ownerName: form.ownerName,

                email: form.email,

                phone: form.phone,

                gstNumber: form.gstNumber,

                address: form.address,

                adminName: form.adminName,

                adminEmail: form.adminEmail,

                adminPhone: form.adminPhone,

                password: form.password
            };

            const response = mode == "create" ? await createCompany(payload) : await updateCompany(company._id, payload);

            const result = response.data;
            toast.success(result.message);
            onSuccess?.();
            resetForm();

            onClose?.();
        }
        catch(error: any){
            toast.error(error?.response?.data?.message || "Something went wrong !");
        }

        finally{
            setLoading(false);
        }
        // API Call Here
    };

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >

            {/* COMPANY INFORMATION */}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

                <div className="mb-6">

                    <h3 className="text-lg font-semibold text-slate-900">
                        Company Information
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Enter company details and contact information
                    </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                        <label className="form-label">
                            Company Name *
                        </label>

                        <input
                            name="companyName"
                            value={form.companyName}
                            onChange={handleChange}
                            placeholder="Enter company name"
                            className="custom-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Company Code *
                        </label>

                        <input
                            name="companyCode"
                            value={form.companyCode}
                            onChange={handleChange}
                            placeholder="ABC001"
                            className="custom-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Owner Name *
                        </label>

                        <input
                            name="ownerName"
                            value={form.ownerName}
                            onChange={handleChange}
                            placeholder="Owner name"
                            className="custom-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Company Email *
                        </label>

                        <input  
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="new-password"
                            placeholder="company@example.com"
                            className="custom-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Company Phone *
                        </label>

                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+91 XXXXX XXXXX"
                            className="custom-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            GST Number
                        </label>

                        <input
                            name="gstNumber"
                            value={form.gstNumber}
                            onChange={handleChange}
                            placeholder="22AAAAA0000A1Z5"
                            className="custom-input"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="form-label">
                            Company Address
                        </label>

                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Enter company address"
                            className=" custom-input min-h-[100px] resize-none "
                        />
                    </div>

                </div>

            </div>

            {/* COMPANY ADMIN */}


            {
                mode === 'create' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <h3 className="text-lg font-semibold text-slate-900">
                                    Company Admin
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Create login credentials for company admin
                                </p>

                            </div>

                        </div>

                        {/* SAME AS OWNER */}

                        <div className=" mb-6 p-4 rounded-xl bg-white border border-slate-200 ">
                            <label className=" flex items-center gap-3 text-sm font-medium cursor-pointer ">
                                <input
                                    type="checkbox"
                                    checked={sameAsOwner}
                                    onChange={(e) =>
                                        handleSameAsOwner(
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4"
                                />

                                Same as Owner Information
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="form-label">
                                    Admin Name *
                                </label>

                                <input
                                    name="adminName"
                                    value={form.adminName}
                                    onChange={handleChange}
                                    placeholder="Admin name"
                                    className="custom-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Admin Email *
                                </label>

                                <input
                                    type="email"
                                    name="adminEmail"
                                    value={form.adminEmail}
                                    onChange={handleChange}
                                    placeholder="admin@example.com"
                                    className="custom-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Admin Phone *
                                </label>

                                <input
                                    name="adminPhone"
                                    value={form.adminPhone}
                                    onChange={handleChange}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="custom-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Password *
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="custom-input"
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Confirm Password *
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className="custom-input"
                                />
                            </div>

                        </div>

                    </div>
                )
            }

            {/* FOOTER */}

            <div
                className=" sticky bottom-0 bg-white border-t border-slate-200 py-4 flex justify-end gap-3 "
            >

                <button type="button" onClick={onClose} className=" px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 ">
                    Cancel
                </button>

                <button type="submit" disabled = {loading} className=" px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium "
                >
                    {
                        loading ? "Please Wait..." : (
                            mode === 'create' ? "Create Company" : "Update Company"
                        )
                    }
                </button>

            </div>

        </form>
    );
}