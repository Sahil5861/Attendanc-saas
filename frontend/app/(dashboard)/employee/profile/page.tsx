"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    BadgeCheck,
    Building2,
    Camera,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    Phone,
    Save,
    User,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomDatePicker from "@/components/common/CustomDatePicker";
import CustomInput from "@/components/common/CustomInput";
import PrimaryButton from "@/components/common/PrimaryButton";
import {
    changeEmployeePassword,
    getEmployeeProfile,
    updateEmployeeProfile,
} from "@/services/employee.service";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";

interface PopulatedField {
    _id?: string;
    title?: string;
    departmentName?: string;
    designationName?: string;
}

interface EmployeeProfile {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    employeeCode?: string;
    image?: string;
    designation?: PopulatedField | null;
    department?: PopulatedField | null;
    branch_id?: PopulatedField | null;
    company_id?: PopulatedField | string | null;
    joiningDate?: string;
    employmentType?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    status?: boolean;
}

interface ProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

type Tab = "profile" | "password";

const emptyProfileForm: ProfileForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
};

const uploadsBase =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "/uploads").replace(/\/$/, "") ||
    "";

function getImageUrl(image?: string | null) {
    if (!image) return null;
    if (/^(https?:|blob:|data:)/i.test(image)) return image;
    return uploadsBase ? `${uploadsBase}/employees/${image}` : `/uploads/employees/${image}`;
}

function getFieldLabel(field?: PopulatedField | string | null) {
    if (!field) return "-";
    if (typeof field === "string") return field;
    return field.title || field.designationName || field.departmentName || "-";
}

function formatDateForInput(date?: string) {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
}

function toProfileForm(employee: EmployeeProfile): ProfileForm {
    return {
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        city: employee.city || "",
        state: employee.state || "",
        country: employee.country || "",
        pincode: employee.pincode || "",
    };
}

export default function Page() {
    const [tab, setTab] = useState<Tab>("profile");
    const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
    const [profile, setProfile] = useState<ProfileForm>(emptyProfileForm);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [password, setPassword] = useState<PasswordForm>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [pwError, setPwError] = useState<string | null>(null);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const avatar = avatarPreview || getImageUrl(employee?.image);
    const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Employee";
    const designation = getFieldLabel(employee?.designation?.title);
    const department = getFieldLabel(employee?.department?.title);
    const joiningDate = useMemo(() => formatDateForInput(employee?.joiningDate), [employee?.joiningDate]);

    const flashSuccess = (message: string) => {
        setSavedMsg(message);
        window.setTimeout(() => setSavedMsg(null), 3000);
    };

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getEmployeeProfile();
            const nextEmployee = res.data.data.employee as EmployeeProfile;
            setEmployee(nextEmployee);
            setProfile(toProfileForm(nextEmployee));
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(fetchProfile);
    }, [fetchProfile]);

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleAvatarPick = (file: File | null) => {
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Only JPG, PNG and WEBP images are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Maximum image size is 5 MB.");
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const dispatch = useDispatch();


    const handleProfileSave = async () => {
        if (!profile.firstName.trim()) {
            toast.error("First name is required");
            return;
        }

        if (!profile.email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (!profile.phone.trim()) {
            toast.error("Phone number is required");
            return;
        }

        try {
            setSavingProfile(true);
            const formData = new FormData();

            Object.entries(profile).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (avatarFile) {
                formData.append("image", avatarFile);
            }

            const res = await updateEmployeeProfile(formData);

            console.log('res update : ', res);
            
            const nextEmployee = res.data.data.employee as EmployeeProfile;
            setEmployee(nextEmployee);
            setProfile(toProfileForm(nextEmployee));
            setAvatarFile(null);
            setAvatarPreview(null);
            flashSuccess(res.data.message || "Profile updated successfully");

            dispatch(
                setAuth({
                    user: res.data.data.user
                })   
            )


        } catch (error: unknown) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async () => {
        setPwError(null);

        if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
            setPwError("Please fill in all password fields.");
            return;
        }

        if (password.newPassword.length < 8) {
            setPwError("New password must be at least 8 characters.");
            return;
        }

        if (password.newPassword !== password.confirmPassword) {
            setPwError("New password and confirm password do not match.");
            return;
        }

        try {
            setSavingPassword(true);
            const res = await changeEmployeePassword(password);
            setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
            flashSuccess(res.data.message || "Password updated successfully");
        } catch (error: unknown) {
            console.error(error);
            setPwError("Failed to update password. Please check your current password.");
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div style={{ background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 16, padding: 28 }}>
                <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>Loading profile...</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div style={{ background: "#fff", border: "1.5px solid #fecaca", borderRadius: 16, padding: 28 }}>
                <p style={{ margin: 0, color: "#dc2626", fontWeight: 700 }}>Employee profile not found.</p>
            </div>
        );
    }

    return (
        <div style={{ margin: "0 auto" }}>
            <div
                style={{
                    background: "#fff",
                    border: "1.5px solid #d1fae5",
                    borderRadius: 18,
                    padding: "28px 26px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                    boxShadow: "0 4px 24px rgba(16,185,129,.06)",
                }}
            >
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                        style={{
                            width: 92,
                            height: 92,
                            borderRadius: "50%",
                            border: "3px solid #d1fae5",
                            background: "linear-gradient(135deg, #d1fae5, #cffafe)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}
                    >
                        {avatar ? (
                            <img src={avatar} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <User size={34} color="#059669" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            border: "2px solid #fff",
                            background: "linear-gradient(135deg, #059669, #0891b2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(5,150,105,.35)",
                        }}
                        title="Change photo"
                    >
                        <Camera size={14} color="#fff" />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        onChange={(e) => handleAvatarPick(e.target.files?.[0] || null)}
                    />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{fullName}</h2>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: employee.status === false ? "#dc2626" : "#15803d",
                                background: employee.status === false ? "#fef2f2" : "#dcfce7",
                                border: `1px solid ${employee.status === false ? "#fca5a5" : "#86efac"}`,
                                borderRadius: 99,
                                padding: "3px 9px",
                                textTransform: "uppercase",
                                letterSpacing: "0.03em",
                            }}
                        >
                            <BadgeCheck size={11} /> {employee.status === false ? "Inactive" : "Active"}
                        </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#64748b" }}>
                        {designation} - {department}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
                        {employee.employeeCode ? `${employee.employeeCode} - ` : ""}
                        {profile.email}
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 22,
                    background: "#fff",
                    border: "1.5px solid #d1fae5",
                    borderRadius: 12,
                    padding: 6,
                    width: "fit-content",
                }}
            >
                <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={User} label="Profile Details" />
                <TabButton active={tab === "password"} onClick={() => setTab("password")} icon={Lock} label="Change Password" />
            </div>

            {savedMsg && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 16,
                        background: "#f0fdf4",
                        border: "1.5px solid #86efac",
                        color: "#15803d",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    <CheckCircle2 size={16} /> {savedMsg}
                </div>
            )}

            {tab === "profile" && (
                <div
                    style={{
                        background: "#fff",
                        border: "1.5px solid #d1fae5",
                        borderRadius: 16,
                        padding: "26px 24px",
                        marginTop: 16,
                        boxShadow: "0 4px 24px rgba(16,185,129,.06)",
                    }}
                >
                    <SectionTitle icon={User} title="Personal Information" subtitle="Update your contact and address details" />

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 18 }}>
                        <CustomInput
                            label="First Name"
                            icon={<User size={13} />}
                            value={profile.firstName}
                            onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                            placeholder="Enter first name"
                            required
                        />
                        <CustomInput
                            label="Last Name"
                            value={profile.lastName}
                            onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                            placeholder="Enter last name"
                        />
                        <CustomInput
                            label="Email Address"
                            type="email"
                            icon={<Mail size={13} />}
                            value={profile.email}
                            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                            placeholder="name@company.com"
                            required
                        />
                        <CustomInput
                            label="Phone Number"
                            icon={<Phone size={13} />}
                            value={profile.phone}
                            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="+91 00000 00000"
                            required
                        />
                        <CustomInput label="Department" value={department} disabled icon={<Building2 size={13} />} />
                        <CustomInput label="Designation" value={designation} disabled />
                        <CustomDatePicker label="Date of Joining" value={joiningDate} onChange={() => undefined} placeholder="Joining date" disabled />
                        <CustomInput label="Employment Type" value={employee.employmentType || "-"} disabled />
                        <div style={{ gridColumn: "1 / -1" }}>
                            <CustomInput
                                label="Address"
                                icon={<MapPin size={13} />}
                                value={profile.address}
                                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                                placeholder="Enter current address"
                            />
                        </div>
                        <CustomInput
                            label="City"
                            value={profile.city}
                            onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                            placeholder="City"
                        />
                        <CustomInput
                            label="State"
                            value={profile.state}
                            onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                            placeholder="State"
                        />
                        <CustomInput
                            label="Country"
                            value={profile.country}
                            onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
                            placeholder="Country"
                        />
                        <CustomInput
                            label="Pincode"
                            value={profile.pincode}
                            onChange={(e) => setProfile((p) => ({ ...p, pincode: e.target.value }))}
                            placeholder="Pincode"
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
                        <PrimaryButton
                            title="Save Changes"
                            icon={<Save size={14} />}
                            onClick={handleProfileSave}
                            loading={savingProfile}
                        />
                    </div>
                </div>
            )}

            {tab === "password" && (
                <div
                    style={{
                        background: "#fff",
                        border: "1.5px solid #d1fae5",
                        borderRadius: 16,
                        padding: "26px 24px",
                        marginTop: 16,
                        maxWidth: 480,
                        boxShadow: "0 4px 24px rgba(16,185,129,.06)",
                    }}
                >
                    <SectionTitle icon={Lock} title="Change Password" subtitle="Use a strong password you do not reuse elsewhere" />

                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
                        <PasswordField
                            label="Current Password"
                            value={password.currentPassword}
                            visible={showPw.current}
                            onToggle={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                            onChange={(v) => setPassword((p) => ({ ...p, currentPassword: v }))}
                            placeholder="Enter current password"
                        />
                        <PasswordField
                            label="New Password"
                            value={password.newPassword}
                            visible={showPw.next}
                            onToggle={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                            onChange={(v) => setPassword((p) => ({ ...p, newPassword: v }))}
                            placeholder="Min. 8 characters"
                        />
                        <PasswordField
                            label="Confirm New Password"
                            value={password.confirmPassword}
                            visible={showPw.confirm}
                            onToggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                            onChange={(v) => setPassword((p) => ({ ...p, confirmPassword: v }))}
                            placeholder="Re-enter new password"
                        />
                    </div>

                    {pwError && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginTop: 14,
                                background: "#fef2f2",
                                border: "1px solid #fca5a5",
                                color: "#dc2626",
                                borderRadius: 8,
                                padding: "9px 12px",
                                fontSize: 12.5,
                                fontWeight: 600,
                            }}
                        >
                            <AlertCircle size={14} /> {pwError}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
                        <button onClick={handlePasswordSave} disabled={savingPassword} style={{ ...primaryBtnStyle, opacity: savingPassword ? 0.7 : 1 }}>
                            <Lock size={14} /> {savingPassword ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon: Icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: typeof User;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: active ? "linear-gradient(135deg, #059669, #0891b2)" : "transparent",
                color: active ? "#fff" : "#64748b",
                transition: "all .15s",
            }}
        >
            <Icon size={14} /> {label}
        </button>
    );
}

function SectionTitle({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: typeof User;
    title: string;
    subtitle: string;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
                style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon size={16} color="#059669" />
            </span>
            <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: "#94a3b8" }}>{subtitle}</p>
            </div>
        </div>
    );
}

function PasswordField({
    label,
    value,
    visible,
    onToggle,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    visible: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#334155",
                }}
            >
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        padding: "10px 40px 10px 12px",
                        borderRadius: 9,
                        border: "1.5px solid #d1fae5",
                        fontSize: 13.5,
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "#94a3b8",
                    }}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

const primaryBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "linear-gradient(135deg, #059669, #0891b2)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(5,150,105,.25)",
};
