"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { initiateSignup } from "@/services/auth.service"; // ⚠️ adjust to your actual signup/OTP-request function

import Captcha, { CaptchaHandle } from "@/components/common/Captcha";
import CustomInput from "@/components/common/CustomInput";

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
];

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef<CaptchaHandle>(null);

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    countryCode: "+91",
    phone: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaRef.current?.verify(captchaInput)) {
      toast.error("Incorrect security code. Please try again.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }

    try {
      setLoading(true);
      const response = await initiateSignup({
        companyName: form.companyName,
        email: form.email,
        phone: `${form.countryCode}${form.phone}`,
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "OTP sent to your email");
        // Adjust this route to wherever your OTP-verification step lives
        // router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        router.push(`/verify-otp/${encodeURIComponent(form.email)}`);
      } else {
        toast.error(response?.data?.message || "Failed to send OTP");
        captchaRef.current?.refresh();
        setCaptchaInput("");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      captchaRef.current?.refresh();
      setCaptchaInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg min-h-screen flex">

      {/* ── LEFT PANEL (same as login) ── */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-14">

        {/* Background decorative circles */}
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

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #059669, #0891b2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v5M9 11v5M2 9h5M11 9h5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ color: "#0f172a", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
            AttendSaaS
          </span>
        </div>

        {/* Hero copy */}
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

          {/* Stats */}
          <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
            {[["100+", "Companies"], ["10K+", "Employees"], ["99.9%", "Uptime"]].map(([num, label]) => (
              <div key={label}>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>{num}</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Feature pills */}
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

        {/* Footer badge */}
        <div className="relative z-10 flex items-center gap-2">
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 0 2px rgba(16,185,129,.2)"
          }} />
          <span style={{ color: "#94a3b8", fontSize: 12 }}>All systems operational</span>
        </div>
      </div>

      {/* ── RIGHT PANEL — Register form ── */}
      <div
        className="flex-1 h-screen overflow-y-auto flex items-center justify-center"
        // style={{ background: "rgba(255,255,255,0.5)" }}
      >

        <div style={{ width: "100%", maxWidth: 700}}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #059669, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v5M9 11v5M2 9h5M11 9h5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>AttendSaaS</span>
          </div>

          {/* Card */}
          <div style={{
            background: "#ffffff",
            border: "1.5px solid #d1fae5",
            // borderRadius: 20,
            padding: "10px 56px",
            minHeight: '100vh',
            paddingTop: '40px',
            boxShadow: "0 8px 40px rgba(16,185,129,.08), 0 1px 3px rgba(0,0,0,.05)"
          }}>

            <div style={{ marginBottom: 28 }}>              
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontWeight:800}}>
                Create your account
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                Sign up with your email and phone number — we&apos;ll send a one-time code to your email.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your business / company name"
                  className="custom-input"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                />
              </div> */}

              <CustomInput
                label="Company Name"
                value={form.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                required
                placeholder="Your business / company name"
              />

              {/* <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="custom-input"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div> */}

                <CustomInput
                  label="Email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@company.com"
                  required

                />
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Phone with country code
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={form.countryCode}
                    onChange={(e) => handleChange("countryCode", e.target.value)}
                    className="custom-input"
                    style={{ width: 110, flexShrink: 0, cursor: "pointer" }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    className="custom-input"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
                    required
                  />
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  Include the country code. Example: +91 98765 43210
                </p>
              </div>

              {/* ── Security verification (Captcha) ── */}
              {/* <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Security Verification
                </label>
                <div style={{ marginBottom: 10 }}>
                  <Captcha ref={captchaRef} />
                </div>
                <input
                  type="text"
                  placeholder="Enter the code above"
                  className="custom-input"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                />
              </div> */}

              <div style={{ marginBottom: 10 }}>
                  <Captcha ref={captchaRef} />
              </div>
              <CustomInput
                label="Security Code"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Sending OTP…
                  </span>
                ) : "Send OTP"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#059669", fontWeight: 700, fontSize: 13, padding: 0,
                  }}
                >
                  Login
                </button>
              </p>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}