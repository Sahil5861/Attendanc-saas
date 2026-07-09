"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { verifyOtp, resendOtp } from "@/services/auth.service"; // ⚠️ adjust to your actual service functions
import { saveAuth } from "@/lib/auth";

import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";


const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpPage({searchParams, } : {searchParams: { email?: string };}) {
    const router = useRouter();
    // const searchParams =();
    const params = useParams();


    const email = decodeURIComponent(params.email as string);

    console.log('email :', email);
    

    const [values, setValues] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/[^0-9]/g, "").slice(-1);

        const next = [...values];
        next[index] = digit;
        setValues(next);

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit once all boxes are filled
        if (digit && next.every((v) => v !== "")) {
            handleVerify(next.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !values[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;

        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((char, i) => (next[i] = char));
        setValues(next);

        const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
        inputRefs.current[lastFilledIndex]?.focus();

        if (pasted.length === OTP_LENGTH) {
            handleVerify(pasted);
        }
    };

    const dispatch = useDispatch();
    

    const handleVerify = async (otp: string) => {
        if (loading) return;

        if (!email) {
            toast.error("Missing email — please restart the signup process");
            return;
        }

        try {
            setLoading(true);
            const res = await verifyOtp({ email, otp });

            if (res?.data?.success) {
                toast.success(res.data.message || "Account created successfully!");
                // Auto-login the user with the token returned by verify-otp
                if (res.data.token) {
                    saveAuth(res.data.token, res.data.user);
                }
                router.push("/login");

                dispatch(
                    setAuth({
                        user: res.data.user,
                        permissions: res.data.permissions,
                        plan: res.data.plan,
                    })
                );
            } else {
                toast.error(res?.data?.message || "Incorrect OTP");
                setValues(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Incorrect or expired OTP");
            setValues(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resending || cooldown > 0) return;

        try {
            setResending(true);
            const res = await resendOtp({ email });

            if (res?.data?.success) {
                toast.success(res.data.message || "New OTP sent");
                setCooldown(RESEND_COOLDOWN);
                setValues(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
            } else {
                toast.error(res?.data?.message || "Failed to resend OTP");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="login-bg min-h-screen flex">

            {/* ── LEFT PANEL (same as login/signup) ── */}
            <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-14">

                <div style={{
                    position: "absolute", top: "-80px", left: "-80px",
                    width: 400, height: 400, borderRadius: "50%",
                    border: "1px solid rgba(16,185,129,.15)"
                }} />
                <div style={{
                    position: "absolute", top: "-30px", left: "-30px",
                    width: 240, height: 240, borderRadius: "50%",
                    border: "1px solid rgba(16,185,129,.1)"
                }} />
                <div style={{
                    position: "absolute", bottom: 60, right: -60,
                    width: 320, height: 320, borderRadius: "50%",
                    border: "1px solid rgba(6,182,212,.12)"
                }} />

                <div className="relative z-10 flex items-center gap-3">
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "linear-gradient(135deg, #059669, #0891b2)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2v5M9 11v5M2 9h5M11 9h5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span style={{ color: "#0f172a", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
                        AttendSaaS
                    </span>
                </div>

                <div className="relative z-10">
                    <p style={{ color: "#059669", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
                        Workforce Management
                    </p>

                    <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, color: "#0f172a", marginBottom: 20 }}>
                        One platform.<br />
                        <span style={{
                            backgroundImage: "linear-gradient(135deg, #059669, #0891b2)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}>
                            Every team.
                        </span>
                    </h1>

                    <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.75, maxWidth: 360 }}>
                        Manage employees, attendance, payroll, subscriptions and
                        branch operations — all from a single modern dashboard.
                    </p>

                    <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
                        {[["100+", "Companies"], ["10K+", "Employees"], ["99.9%", "Uptime"]].map(([num, label]) => (
                            <div key={label}>
                                <p style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>{num}</p>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
                        {["Attendance Tracking", "Payroll", "Branch Ops", "Analytics"].map((tag) => (
                            <span key={tag} style={{
                                background: "rgba(16,185,129,.08)",
                                border: "1px solid rgba(16,185,129,.2)",
                                color: "#065f46",
                                fontSize: 12, fontWeight: 500,
                                padding: "5px 12px", borderRadius: 99
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 0 2px rgba(16,185,129,.2)"
                    }} />
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>All systems operational</span>
                </div>
            </div>

            {/* ── RIGHT PANEL — OTP form ── */}
            <div className="flex-1 h-screen overflow-y-auto flex items-center justify-center px-6 py-10">
                <div style={{ width: "100%", maxWidth: 440 }}>

                    <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                        <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: "linear-gradient(135deg, #059669, #0891b2)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                                <path d="M9 2v5M9 11v5M2 9h5M11 9h5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>AttendSaaS</span>
                    </div>

                    <div style={{
                        background: "#ffffff",
                        border: "1.5px solid #d1fae5",
                        borderRadius: 20,
                        padding: "40px 36px",
                        boxShadow: "0 8px 40px rgba(16,185,129,.08), 0 1px 3px rgba(0,0,0,.05)"
                    }}>

                        <div style={{ marginBottom: 24 }}>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontWeight: 800 }}>
                                Verify your email
                            </h1>
                            <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                                We&apos;ve sent a 6-digit code to{" "}
                                <span style={{ color: "#0f172a", fontWeight: 600 }}>{email || "your email"}</span>
                            </p>
                        </div>

                        {/* OTP boxes */}
                        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: 22 }}>
                            {values.map((value, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={value}
                                    disabled={loading}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    style={{
                                        width: 48,
                                        height: 56,
                                        textAlign: "center",
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color: "#0f172a",
                                        border: `1.5px solid ${value ? "#10b981" : "#d1fae5"}`,
                                        borderRadius: 10,
                                        outline: "none",
                                        background: loading ? "#f8fafc" : "#fff",
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            disabled={loading || values.some((v) => !v)}
                            onClick={() => handleVerify(values.join(""))}
                            className="login-btn"
                            style={{ opacity: loading || values.some((v) => !v) ? 0.6 : 1 }}
                        >
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
                                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Verifying…
                                </span>
                            ) : "Verify & Create Account"}
                        </button>

                        <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 18 }}>
                            Didn&apos;t get the code?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending || cooldown > 0}
                                style={{
                                    background: "none", border: "none",
                                    cursor: resending || cooldown > 0 ? "not-allowed" : "pointer",
                                    color: cooldown > 0 ? "#94a3b8" : "#059669",
                                    fontWeight: 700, fontSize: 13, padding: 0,
                                }}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
                            </button>
                        </p>

                        <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 8 }}>
                            Wrong email?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/register")}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#059669", fontWeight: 700, fontSize: 13, padding: 0,
                                }}
                            >
                                Go back
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}