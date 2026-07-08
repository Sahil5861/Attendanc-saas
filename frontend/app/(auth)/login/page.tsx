"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth.service";
import { saveAuth } from "@/lib/auth";
import toast from "react-hot-toast";

import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";

import Captcha, { CaptchaHandle } from "@/components/common/Captcha";
import CustomInput from "@/components/common/CustomInput";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [captchaInput, setCaptchaInput] = useState("");

  const captchaRef = useRef<CaptchaHandle>(null);

  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verify captcha before hitting the API
    if (!captchaRef.current?.verify(captchaInput)) {
      toast.error("Incorrect security code. Please try again.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(form.email, form.password);

      saveAuth(response.token, response.user);

      dispatch(
        setAuth({
          user: response.user,
          permissions: response.permissions,
          plan: response.plan,
        })
      );

      toast.success("Login successful");
      const role = response.user?.role;
      switch (role) {
        case "SUPER_ADMIN":
          router.push("/super-admin/dashboard");
          break;
        case "COMPANY_ADMIN":
          router.push("/company/dashboard");
          break;
        case "BRANCH_MANAGER":
          router.push("/branch/dashboard");
          break;
        default:
          router.push("/employee/dashboard");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
      // Regenerate captcha after any failed attempt (login or captcha) to prevent reuse
      captchaRef.current?.refresh();
      setCaptchaInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg h-screen flex overflow-hidden">

      {/* ── LEFT PANEL (unchanged) ── */}
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
              <path d="M9 2v5M9 11v5M2 9h5M11 9h5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
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

      {/* ── RIGHT PANEL — fits fully within viewport, scrolls internally only if truly needed ── */}
      <div
        className="flex-1 h-screen overflow-y-auto flex items-center justify-center"
      // style={{ background: "rgba(255,255,255,0.5)" }}
      >
        <div style={{ width: "100%", maxWidth: 700 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
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

            <div style={{ marginBottom: 20 }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontWeight: 800 }}>
                Welcome back
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <CustomInput
                label="Email Address"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <CustomInput
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    style={{ accentColor: "#059669", width: 15, height: 15 }}
                  />
                  <span style={{ fontSize: 13, color: "#64748b" }}>Remember me</span>
                </label>
                <button type="button" style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#059669", fontSize: 13, fontWeight: 600, padding: 0
                }}>
                  Forgot password?
                </button>
              </div>

              {/* ── Security verification (Captcha) ── */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  Security Verification
                </label>
                <div style={{ marginBottom: 8 }}>
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
              </div>

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
                    Signing in…
                  </span>
                ) : "Sign In →"}
              </button>

              {/* ── Create account link ── */}
              <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                New to AttendSaaS?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#059669", fontWeight: 700, fontSize: 13, padding: 0,
                  }}
                >
                  Create account
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