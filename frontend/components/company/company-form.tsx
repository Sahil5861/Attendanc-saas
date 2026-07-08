"use client";

import { useState, useEffect } from "react";

import { createCompany, getCitiesByState, updateCompany } from "@/services/super-admin.service";
import toast from "react-hot-toast";
import CustomSelect from "../common/CustomSelect";
import CustomInput from "../common/CustomInput";

interface Props {
    mode?: "create" | "edit";
    company?: any;
    states?: any;
    onClose?: () => void;
    onSuccess?: () => void;
}

const defaultForm = {
    companyName: "",
    companyCode: "",
    ownerName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    gstNumber: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
    confirmPassword: "",
}

const adminFeilds = [
    {name: 'adminName', label: 'Admin Name', placeholder: 'John'},
    {name: 'adminEmail', label: 'Admin Email', placeholder: 'example@gmail.com'},
    {name: 'adminPhone', label: 'Admin Name', placeholder: '+91 xxxxx xxxxx'},
]

export default function CompanyForm({
    mode = "create",
    company,
    states,
    onClose,
    onSuccess
}: Props) {

    const [loading, setLoading] = useState(false);
    
    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const [sameAsOwner, setSameAsOwner] = useState(false);

    useEffect(() => {
        if (!company) {
            return;
        }

        setForm({
            companyName: company.companyName || "",
            companyCode: company.companyCode || "",
            ownerName: company.ownerName || "",
            email: company.email || "",
            phone: company.phone || "",
            gstNumber: company.gst || "",
            address: company.address || "",
            adminName: company.adminName || "",
            adminEmail: company.adminEmail || "",
            adminPhone: company.adminPhone || "",
            password: "",
            city: company.city || "",
            state: company.state || "",
            confirmPassword: "",

        });
    }, [company]);

    const [form, setForm] = useState(defaultForm);

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
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const updateCities = async (stateId: string) => {
        try {
            setCitiesLoading(true);
            const response = await getCitiesByState(stateId);

            setCities(response.data.data || []);
            setCitiesLoading(false);


        } catch (error) {
            console.error(error);
        }
    };


    const handleStateChange = (
        value: string
    ) => {
        const stateId = value;

        setForm((prev) => ({
            ...prev,
            state: stateId,
            city: "", // reset city when state changes
        }));

        updateCities(stateId);
    };

    const handleCityChange = (
        value: string
    ) => {
        const cityId = value;

        setForm((prev) => ({
            ...prev,
            city: cityId,
        }));
    };


    const resetForm = () => {
        setForm(defaultForm);

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
                city: form.city,
                state: form.state,
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
        catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong !");
        }

        finally {
            setLoading(false);
        }
        // API Call Here
    };

    return (

        <form
            onSubmit={handleSubmit} className="space-y-8"
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

                    <CustomInput
                        label="Company Name"
                        name="companyName"
                        value={form.companyName}
                        placeholder="Enter company name"
                        onChange={handleChange}
                        required
                    />

                    <CustomInput
                        label="Company Code"
                        name="companyCode"
                        value={form.companyCode}
                        placeholder="ABC001"
                        onChange={handleChange}
                        required
                    />

                    <CustomInput
                        label="Owner Name"
                        name="ownerName"
                        value={form.ownerName}
                        placeholder="Owner name"
                        onChange={handleChange}
                        required
                    />

                    <CustomInput
                        label="Company Email"
                        type="email"
                        name="email"
                        value={form.email}
                        placeholder="company@example.com"
                        onChange={handleChange}
                        required
                    />

                    <CustomInput
                        label="Company Phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        placeholder="+91 XXXXX XXXXX"
                        onChange={handleChange}
                        required
                    />

                    <CustomInput
                        label="GST Number"
                        name="gstNumber"
                        value={form.gstNumber}
                        placeholder="22AAAAA0000A1Z5"
                        onChange={handleChange}
                    />


                    <CustomSelect
                        label="State"
                        value={form.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        searchable
                        options={[
                            { label: "Select State", value: "" },
                            ...(states ?? []).map((state: any) => ({
                                label: state.name,
                                value: state.stateId,
                            })),
                        ]}
                    />


                    <CustomSelect
                        label="City"
                        loading={citiesLoading}
                        value={form.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        searchable
                        options={[
                            { label: "Select City", value: "" },     
                            ...(cities ?? []).map((city: any) => ({
                                label: city.name,
                                value: city.cityId,
                            }))                       
                        ]}
                    />

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



                            <CustomInput
                                label="Admin Name"
                                name="adminName"
                                value={form.adminName}
                                placeholder="Admin name"
                                onChange={handleChange}
                                required
                            />

                            <CustomInput
                                label="Admin Email"
                                type="email"
                                name="adminEmail"
                                value={form.adminEmail}
                                placeholder="admin@example.com"
                                onChange={handleChange}
                                required
                            />

                            <CustomInput
                                label="Admin Phone"
                                name="adminPhone"
                                value={form.adminPhone}
                                placeholder="+91 XXXXX XXXXX"
                                onChange={handleChange}
                                required
                            />

                            <CustomInput
                                label="Password"
                                type="password"
                                name="password"
                                value={form.password}
                                placeholder="Enter password"
                                onChange={handleChange}
                                required
                            />

                            <CustomInput
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                placeholder="Confirm password"
                                onChange={handleChange}
                                required
                            />

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

                <button type="submit" disabled={loading} className=" px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium "
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