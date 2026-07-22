"use client";

import { useEffect, useState } from "react";
import {
    Building2,
    Clock,
    Globe2,
    Image as ImageIcon,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomInput from "@/components/common/CustomInput";
import CustomSelect from "@/components/common/CustomSelect";
import { getStates, getCitiesByState } from "@/services/super-admin.service";

import { getCompanySettings, updateCompanySettings } from "@/services/companySettings.service";

interface BranchSettingsForm {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    timeFormat: "12" | "24";
    logo: string;
    startTime: string;
    endTime: string;
    recess: string;
    recessEnd: string;
    sickLeave: number,
    casualLeave: number,
    paidLeave: number,
    carryForward: boolean,
    maxCarryForward: 12,
    latitude: number | null;
    longitude: number | null;
}

const DEFAULT_FORM: BranchSettingsForm = {
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12",
    logo: "",
    startTime: "",
    endTime: "",
    recess: "",
    recessEnd: "",
    sickLeave: 2,
    casualLeave: 2,
    paidLeave: 1,
    carryForward: true,
    maxCarryForward: 12,
    latitude: null,
    longitude: null,
};

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];
const TIMEZONES = [
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Singapore",
    "Europe/London",
    "America/New_York",
    "UTC",
];


interface State {
    _id: string;
    stateId: string;
    name: string;
};

interface City {
    _id: string;
    stateId: string;
    cityId: string;
    name: string;
};

export default function CompanySettingsPage() {
    const [form, setForm] = useState<BranchSettingsForm>(DEFAULT_FORM);
    const [loading, setLoading] = useState(true);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedState, setSelectedState] = useState<State | null>(null);


    useEffect(() => {
        fetchstates();
        fetchSettings();
    }, []);


    useEffect(() => {
        if (!form.state) return;

        fetchCities(form.state);
    }, [form.state]);


    async function fetchstates() {
        try {
            setCitiesLoading(true);
            const res = await getStates();
            setStates(res.data.data);
            setCitiesLoading(false);
        } catch (error) {
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;

            toast.error(message || "Failed to load states");
        }
        finally {
            setCitiesLoading(false);
        }
    }

    async function fetchCities(stateId: string) {
        try {
            setCitiesLoading(true)
            const res = await getCitiesByState(stateId);
            setCities(res.data.data);
            setCitiesLoading(false)
        } catch (error) {
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;

            toast.error(message || "Failed to load cities");
        }
        finally {
            setCitiesLoading(false);
        }
    }



    async function fetchSettings() {
        try {
            setLoading(true);
            const response = await getCompanySettings();
            const data = response?.data?.data;

            console.log('data : ', data);


            if (data) {
                setForm((prev) => ({
                    ...prev,
                    ...data,
                }));
            }
        } catch (error: unknown) {
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;

            toast.error(message || "Failed to load company settings");
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (field: keyof BranchSettingsForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));

    };


    const handleStateChange = (feild: keyof BranchSettingsForm, value: string) => {
        setForm((prev) => ({
            ...prev, [feild]: value, 'city': ''
        }))

        const selected = states.find((state) => state._id === value) || null;

        setSelectedState(selected);

        fetchCities(value)
    }

    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser");
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
                toast.success("Current location captured");
                setLocating(false);
            },
            (error) => {
                toast.error(error.message || "Failed to capture location");
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log('form : ', form);


            await updateCompanySettings(form);
            toast.success("Company settings saved");
        } catch (error: unknown) {
            const message =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;

            toast.error(message || "Failed to save company settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 pb-10">
                <div className="h-8 w-56 rounded-lg bg-slate-100 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Company Settings
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage this company&apos;s profile, preferences and location
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ---- Basic Information ---- */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <Building2 size={18} />
                        </span>
                        <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
                    </div>

                    <CustomInput
                        label="Company Name"
                        value={form.companyName}
                        onChange={((e) => handleChange("companyName", e.target.value))}
                        placeholder="e.g. Beta Company - Andheri Company"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    

                        <CustomInput
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={((e) => handleChange("email", e.target.value))}
                            placeholder="company@gmail.com"
                            icon={<Mail size={14} />}
                        />

                        <Field label="Phone" icon={<Phone size={14} />}>
                            <input
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="+91 98765 43210"
                                className="input"
                            />
                        </Field>
                    </div>

                    <Field label="Address">
                        <textarea
                            value={form.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            placeholder="Street, area, landmark"
                            rows={2}
                            className="input resize-none"
                        />
                    </Field>



                    <div className="grid grid-cols-2 gap-4">

                        <CustomSelect
                            label="State"
                            value={form.state}
                            onChange={((e) => handleStateChange("state", e.target.value))}
                            searchable
                            options={[
                                ...states.map((state) => (
                                    { label: state.name, value: state.stateId }
                                ))
                            ]}
                        />


                        <CustomSelect
                            label="City"
                            value={form.city}
                            loading={citiesLoading}
                            onChange={((e) => handleChange("city", e.target.value))}
                            options={[
                                ...cities.map((city) => (
                                    { label: city.name, value: city.cityId }
                                ))
                            ]}
                        />                    
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Country">
                            <input
                                value={form.country}
                                onChange={(e) => handleChange("country", e.target.value)}
                                className="input"
                            />
                        </Field>

                        <Field label="Postal Code">
                            <input
                                value={form.postalCode}
                                onChange={(e) => handleChange("postalCode", e.target.value)}
                                className="input"
                            />
                        </Field>
                    </div>
                </div>

                {/* ---- Preferences ---- */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <Globe2 size={18} />
                        </span>
                        <h2 className="text-base font-bold text-slate-900">Regional Preferences</h2>
                    </div>

                    <Field label="Timezone">
                        <select
                            value={form.timezone}
                            onChange={(e) => handleChange("timezone", e.target.value)}
                            className="input"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz}>
                                    {tz}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Currency">
                        <select
                            value={form.currency}
                            onChange={(e) => handleChange("currency", e.target.value)}
                            className="input"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Date Format">
                        <select
                            value={form.dateFormat}
                            onChange={(e) => handleChange("dateFormat", e.target.value)}
                            className="input"
                        >
                            {DATE_FORMATS.map((f) => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Time Format" icon={<Clock size={14} />}>
                        <div className="flex gap-2">
                            {(["12", "24"] as const).map((format) => (
                                <button
                                    type="button"
                                    key={format}
                                    onClick={() => handleChange("timeFormat", format)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${form.timeFormat === format
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {format}-hour
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field label="Logo URL" icon={<ImageIcon size={14} />}>
                        <input
                            value={form.logo}
                            onChange={(e) => handleChange("logo", e.target.value)}
                            placeholder="https://..."
                            className="input"
                        />
                    </Field>
                </div>

                {/* ---- Location ---- */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 lg:col-span-2">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <MapPin size={18} />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Company Location</h2>
                                <p className="text-xs text-slate-500">
                                    Capture the exact GPS coordinates of this company
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCaptureLocation}
                            disabled={locating}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60 transition"
                        >
                            {locating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                            {locating ? "Locating..." : "Capture Current Location"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Latitude">
                            <input
                                value={form.latitude ?? ""}
                                readOnly
                                placeholder="Not captured yet"
                                className="input bg-slate-50 text-slate-500"
                            />
                        </Field>

                        <Field label="Longitude">
                            <input
                                value={form.longitude ?? ""}
                                readOnly
                                placeholder="Not captured yet"
                                className="input bg-slate-50 text-slate-500"
                            />
                        </Field>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition: border-color 0.15s ease;
        }
        .input:focus {
          border-color: rgb(16 185 129);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }
      `}</style>
        </div>
    );
}

function Field({
    label,
    icon,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                {icon}
                {label}
            </label>
            {children}
        </div>
    );
}