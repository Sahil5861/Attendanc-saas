"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomInput from "@/components/common/CustomInput";
import {
    resetPassword,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
} from "@/services/auth.service"; // ⚠️ adjust to your actual service function names

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // ── Step 1: send OTP to entered email ──
    const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;

        try {
            setLoading(true);
            const payload = {
                email: email,
            };
            const res = await sendForgotPasswordOtp(payload);

            if (res?.data?.success) {
                toast.success(res.data.message || "OTP sent to your email");
                setStep("otp");
                setCooldown(RESEND_COOLDOWN);
                setOtpValues(Array(OTP_LENGTH).fill(""));
                setTimeout(() => otpRefs.current[0]?.focus(), 50);
            } else {
                toast.error(res?.data?.message || "Failed to send OTP");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resending || cooldown > 0) return;

        try {
            setResending(true);
            const payload = {
                email: email
            };
            const res = await sendForgotPasswordOtp(payload);

            if (res?.data?.success) {
                toast.success(res.data.message || "New OTP sent");
                setCooldown(RESEND_COOLDOWN);
                setOtpValues(Array(OTP_LENGTH).fill(""));
                otpRefs.current[0]?.focus();
            } else {
                toast.error(res?.data?.message || "Failed to resend OTP");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResending(false);
        }
    };

    // ── Step 2: OTP box handlers ──
    const handleOtpChange = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/[^0-9]/g, "").slice(-1);

        const next = [...otpValues];
        next[index] = digit;
        setOtpValues(next);

        if (digit && index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        }

        if (digit && next.every((v) => v !== "")) {
            handleVerifyOtp(next.join(""));
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;

        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((char, i) => (next[i] = char));
        setOtpValues(next);

        const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
        otpRefs.current[lastFilledIndex]?.focus();

        if (pasted.length === OTP_LENGTH) {
            handleVerifyOtp(pasted);
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        if (loading) return;

        try {
            setLoading(true);

            const payload = {
                email: email,
                otp: otp,
            };
            const res = await verifyForgotPasswordOtp(payload);

            if (res?.data?.success) {
                toast.success(res.data.message || "OTP verified");
                // Pass email + reset token forward so the reset-password page can
                // authorize the password change without asking to log in again.
                // const resetToken = res.data.resetToken || "";
                // router.push(
                //     `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`
                // );

                setStep("reset");
            } else {
                toast.error(res?.data?.message || "Incorrect OTP");
                setOtpValues(Array(OTP_LENGTH).fill(""));
                otpRefs.current[0]?.focus();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Incorrect or expired OTP");
            setOtpValues(Array(OTP_LENGTH).fill(""));
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        // Call reset password API

        try {
            const data = {
                email:email, 
                password: password,
                confirmPassword : confirmPassword
            };


            const res = await resetPassword(data)

            if (res.data.success == true) {
                toast.success('Password Updated successfully !');
                // back to login

                router.push("/login")
            }

            else{
                toast.error('Something')
            }
            
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong !');
        }
    };

    return (
        <div className="login-bg min-h-screen flex items-center justify-center px-4">
            <div className="flex-1 h-screen overflow-y-auto flex items-center justify-center">
                <div
                    style={{
                        width: "100%",
                        maxWidth: 440,
                        background: "#fff",
                        border: "1.5px solid #d1fae5",
                        borderRadius: 22,
                        padding: "40px 40px",
                        boxShadow: "0 20px 60px rgba(16,185,129,.10)",
                    }}
                >
                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-2 mb-6">
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

                    {step === "email" ? (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontWeight: 800 }}>
                                    Forgot password?
                                </h1>
                                <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                                    Enter your email and we&apos;ll send you a one-time code to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <CustomInput
                                    label="Email Address"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="login-btn"
                                    style={{ marginTop: 2, opacity: loading ? 0.6 : 1 }}
                                >
                                    {loading ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                            <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
                                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            Sending OTP…
                                        </span>
                                    ) : "Send OTP"}
                                </button>

                                <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                                    Remembered your password?{" "}
                                    <button
                                        type="button"
                                        onClick={() => router.push("/login")}
                                        style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            color: "#059669", fontWeight: 700, fontSize: 13, padding: 0,
                                        }}
                                    >
                                        Back to Login
                                    </button>
                                </p>
                            </form>
                        </>
                    ) :
                        step === 'otp' ? (
                            <>
                                <div style={{ marginBottom: 20 }}>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontWeight: 800 }}>
                                        Enter verification code
                                    </h1>
                                    <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                                        We&apos;ve sent a 6-digit code to{" "}
                                        <span style={{ color: "#0f172a", fontWeight: 600 }}>{email}</span>
                                    </p>
                                </div>

                                {/* OTP boxes */}
                                <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 20 }}>
                                    {otpValues.map((value, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={value}
                                            disabled={loading}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            style={{
                                                width: 44,
                                                height: 52,
                                                textAlign: "center",
                                                fontSize: 20,
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
                                    disabled={loading || otpValues.some((v) => !v)}
                                    onClick={() => handleVerifyOtp(otpValues.join(""))}
                                    className="login-btn"
                                    style={{ opacity: loading || otpValues.some((v) => !v) ? 0.6 : 1 }}
                                >
                                    {loading ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                            <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
                                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            Verifying…
                                        </span>
                                    ) : "Verify OTP"}
                                </button>

                                <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 16 }}>
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
                                        onClick={() => setStep("email")}
                                        style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            color: "#059669", fontWeight: 700, fontSize: 13, padding: 0,
                                        }}
                                    >
                                        Go back
                                    </button>
                                </p>
                            </>
                        ) :
                            step === 'reset' ? (
                                <>
                                    <div style={{ marginBottom: 24 }}>
                                        <h1
                                            className="text-2xl font-bold text-gray-900 mb-2"
                                            style={{ fontWeight: 800 }}
                                        >
                                            Reset Password
                                        </h1>

                                        <p
                                            style={{
                                                color: "#94a3b8",
                                                fontSize: 13,
                                                marginTop: 4,
                                                marginBottom: 0,
                                            }}
                                        >
                                            Your identity has been verified. Create a strong new password for your
                                            account.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleResetPassword}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 16,
                                        }}
                                    >
                                        <CustomInput
                                            label="New Password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />

                                        <CustomInput
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="login-btn"
                                            style={{ marginTop: 2, opacity: loading ? 0.6 : 1 }}
                                        >
                                            {loading ? (
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <svg
                                                        style={{ animation: "spin 1s linear infinite" }}
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="rgba(255,255,255,.3)"
                                                            strokeWidth="3"
                                                        />
                                                        <path
                                                            d="M12 2a10 10 0 0110 10"
                                                            stroke="white"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    Updating Password...
                                                </span>
                                            ) : (
                                                "Reset Password"
                                            )}
                                        </button>

                                        <p
                                            style={{
                                                textAlign: "center",
                                                fontSize: 13,
                                                color: "#64748b",
                                                marginTop: 4,
                                            }}
                                        >
                                            Remember your password?{" "}
                                            <button
                                                type="button"
                                                onClick={() => router.push("/login")}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#059669",
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    padding: 0,
                                                }}
                                            >
                                                Back to Login
                                            </button>
                                        </p>
                                    </form>
                                </>
                            ) : null
                    }
                </div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}