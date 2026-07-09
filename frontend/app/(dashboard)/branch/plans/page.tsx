// app/(branch)/plans/page.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    getPlans,
    getBranchActivePlan,
    assignPlanToBranch,
} from "@/services/branch.service";

import Cookies from "js-cookie";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import { useSelector, useDispatch  } from "react-redux";
import { setActiveBranch, clearActiveBranch } from "@/store/slices/branchSlice";
import { RootState } from "@/store";
import { Cookie } from "next/font/google";
import { createOrder, createOrderForPlan } from "@/services/payments";

// ── Types ──────────────────────────────────────────────────────────────
interface Feature {
    _id: string;
    name: string;
    feature_id: any;
}

interface Plan {
    _id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    isCustom: boolean;
    status: boolean;
    billingCycle: string;
    features: Feature[];
}

interface BranchPlanRelation {
    _id: string;
    branch_id: string;
    plan_id: string;
    status: "active" | "expired";
    billingCycle: "monthly" | "yearly";
    createdAt?: string;
}

interface Props {
    branchId: string;   // pass via prop / route param / context — already known
}

// ── Component ──────────────────────────────────────────────────────────
export default function BranchPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<BranchPlanRelation | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    
    const dispatch = useDispatch();

    // Confirmation modal state
    const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
    const [assigning, setAssigning] = useState(false);


    const branchId: string = Cookies.get("active_branch_id") || "";

    // ── Load plans + current active plan ──────────────────────────────────
    const loadData = async () => {
        try {
            setLoading(true);
            const [plansRes, activeRes] = await Promise.all([
                getPlans(),
                getBranchActivePlan(branchId),
            ]);

            console.log('Plan res :', plansRes);
            console.log('activeRes :', activeRes);

            setPlans((plansRes.data.data || []).filter((p: Plan) => p.status !== false));
            setCurrentPlan(activeRes.data.data || null);
            setBillingCycle(activeRes.data.data.billingCycle)
        } catch {
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (branchId) loadData();
    }, [branchId]);


    const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
            if (document.getElementById("razorpay-sdk")) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");
            script.id = "razorpay-sdk";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    // ── Confirm assignment ─────────────────────────────────────────────────
    const handlePayment = async (price: number, branchId: string, planId:string, planName:string, billingCycle:string) => {
        try {
            setLoading(true);

            // Load Razorpay SDK
            const loaded = await loadRazorpayScript();

            if (!loaded) {
                alert("Unable to load Razorpay SDK");
                return;
            }

            // Create Order from backend

            const payload=  {
                amount: price,
                branch_id: branchId,
                plan_id: planId,
                billingCycle: billingCycle
            };
            const resposne = await createOrderForPlan(payload)

            console.log('res : ',resposne.data.data)
            const order = resposne.data.data.order;
            const branch = resposne.data.data.branch;

            dispatch(clearActiveBranch());

            dispatch(setActiveBranch(branch));


            
            console.log('order: ', order);


            // return;
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

                amount: order.amount,
                currency: order.currency,
                order_id: order.id,

                name: "My Company",
                description: "Payment",

                handler: async function (resposne: any) {
                    console.log("Payment Success", resposne);

                    const base_url = process.env.NEXT_PUBLIC_API_URL;

                    await fetch(`${base_url}/payments/verify-payment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(resposne),
                    });

                    alert("Payment Successful");
                    toast.success(`${planName} assigned successfully`);
                },

                prefill: {
                    name: "Sahil",
                    email: "test@example.com",
                    contact: "9999999999",
                },

                theme: {
                    // color: "#3399cc",
                    color: "#0f172a"
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", function (response: any) {
                console.error(response.error);
                alert("Payment Failed");
            });

            razorpay.open();
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    const handleConfirmAssign = async () => {
        if (!confirmPlan) return;

        const price =
            billingCycle === "monthly" ? confirmPlan.monthlyPrice : confirmPlan.yearlyPrice;

        try {
            setAssigning(true);

            await handlePayment(price, branchId, confirmPlan._id, confirmPlan.name, billingCycle); // agar reject hua toh catch mein jayega            
            setConfirmPlan(null);
            loadData();
        } catch (err: any) {
            // Payment cancel / fail / verify fail — sab yahan aayega
            const msg = err?.message || err?.response?.data?.message || "Failed to assign plan";

            // User ne khud cancel kiya toh silent rehna better hai
            if (msg === "Payment cancelled by user") {
                console.log("User cancelled payment");
            } else {
                toast.error(msg);
            }
        } finally {
            setAssigning(false);
        }
    };


    const isCurrentPlan = (planId: string, cycle: "monthly" | "yearly") => {

        return (
            currentPlan?.plan_id === planId && 
            currentPlan?.status === "active" &&
            currentPlan?.billingCycle === cycle
        )
    } 

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 20px 60px" }}>

            {/* ── Header ── */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                    textTransform: "uppercase", color: "#059669", background: "#f0fdf4",
                    border: "1px solid #86efac", padding: "4px 12px", borderRadius: 99, marginBottom: 12,
                }}>
                    Subscription
                </span>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Choose a Plan for Your Branch
                </h1>
                <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
                    Pick the plan that fits your branch's needs. You can change it anytime.
                </p>

                {/* Current plan banner */}
                {currentPlan?.status === "active" && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
                        background: "#ecfeff", border: "1.5px solid #a5f3fc", color: "#0e7490",
                        fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 10,
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Currently subscribed to{" "}
                        <strong>{plans.find((p) => p._id === currentPlan.plan_id)?.name || "a plan"}</strong>
                    </div>
                )}
            </div>

            {/* ── Billing toggle ── */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
                <div style={{
                    display: "inline-flex", background: "#f1f5f9", borderRadius: 12, padding: 4,
                    border: "1.5px solid #e2e8f0",
                }}>
                    {(["monthly", "yearly"] as const).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setBillingCycle(cycle)}
                            style={{
                                padding: "8px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                                border: "none", cursor: "pointer", transition: "all .15s",
                                background: billingCycle === cycle ? "#fff" : "transparent",
                                color: billingCycle === cycle ? "#059669" : "#64748b",
                                boxShadow: billingCycle === cycle ? "0 2px 8px rgba(16,185,129,.15)" : "none",
                            }}
                        >
                            {cycle === "monthly" ? "Monthly" : "Yearly"}
                            {cycle === "yearly" && (
                                <span style={{
                                    marginLeft: 6, fontSize: 10, fontWeight: 700,
                                    background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: 99,
                                }}>
                                    Save
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Loading state ── */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            height: 380, borderRadius: 18, background: "#f8fafc",
                            border: "1.5px solid #f1f5f9", animation: "pulse 1.5s ease-in-out infinite",
                        }} />
                    ))}
                </div>
            ) : plans.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px 20px", background: "#fff",
                    border: "1.5px solid #e2e8f0", borderRadius: 16,
                }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
                    <p style={{ fontWeight: 700, color: "#64748b", fontSize: 15, margin: 0 }}>No plans available</p>
                </div>
            ) : (
                /* ── Plan cards grid ── */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    {plans.map((plan) => {
                        const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                        const isCurrent = isCurrentPlan(plan._id, billingCycle);
                        const isPopular = !plan.isCustom && plan.name.toLowerCase().includes("growth");

                        return (
                            <div
                                key={plan._id}
                                style={{
                                    position: "relative",
                                    background: "#fff",
                                    borderRadius: 18,
                                    border: `2px solid ${isCurrent ? "#10b981" : isPopular ? "#a7f3d0" : "#e2e8f0"}`,
                                    boxShadow: isCurrent
                                        ? "0 8px 28px rgba(16,185,129,.18)"
                                        : isPopular
                                            ? "0 6px 20px rgba(16,185,129,.1)"
                                            : "0 2px 10px rgba(15,23,42,.04)",
                                    display: "flex", flexDirection: "column",
                                    overflow: "hidden",
                                    transition: "transform .2s, box-shadow .2s",
                                }}
                                onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                            >
                                {/* Ribbon */}
                                {(isCurrent || isPopular) && (
                                    <div style={{
                                        position: "absolute", top: 0, right: 0,
                                        background: isCurrent ? "#10b981" : "#f59e0b",
                                        color: "#fff", fontSize: 10, fontWeight: 700,
                                        letterSpacing: ".06em", textTransform: "uppercase",
                                        padding: "5px 14px", borderRadius: "0 0 0 12px",
                                    }}>
                                        {isCurrent ? "Current Plan" : "Popular"}
                                    </div>
                                )}

                                {/* Header */}
                                <div style={{ padding: "26px 24px 18px", borderBottom: "1px solid #f1f5f9" }}>
                                    {plan.isCustom && (
                                        <span style={{
                                            display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                                            textTransform: "uppercase", color: "#7c3aed", background: "#f5f3ff",
                                            border: "1px solid #ddd6fe", padding: "2px 9px", borderRadius: 99, marginBottom: 10,
                                        }}>
                                            Custom
                                        </span>
                                    )}
                                    <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                        {plan.name}
                                    </h3>
                                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "6px 0 0", minHeight: 36, lineHeight: 1.5 }}>
                                        {plan.description || "No description provided."}
                                    </p>

                                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 16 }}>
                                        <span style={{ fontSize: 30, fontWeight: 800, color: "#0f172a" }}>
                                            ₹{(price ?? 0).toLocaleString("en-IN")}
                                        </span>
                                        <span style={{ fontSize: 13, color: "#94a3b8" }}>
                                            /{billingCycle === "monthly" ? "month" : "year"}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div style={{ padding: "18px 24px", flex: 1 }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>
                                        What's included
                                    </p>
                                    {plan.features?.length === 0 ? (
                                        <p style={{ fontSize: 13, color: "#cbd5e1" }}>No features listed</p>
                                    ) : (
                                        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                                            {plan.features.map((f) => (
                                                <li key={f._id} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: "#334155" }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"
                                                        style={{ flexShrink: 0, marginTop: 1 }}>
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    {f.feature_id.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* CTA */}
                                <div style={{ padding: "0 24px 24px" }}>
                                    {isCurrent ? (
                                        <button
                                            disabled
                                            style={{
                                                width: "100%", padding: "11px 0", borderRadius: 11,
                                                border: "1.5px solid #a7f3d0", background: "#f0fdf4",
                                                color: "#059669", fontSize: 14, fontWeight: 700,
                                                cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            }}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Selected
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmPlan(plan)}
                                            style={{
                                                width: "100%", padding: "11px 0", borderRadius: 11,
                                                border: "none", cursor: "pointer",
                                                background: isPopular
                                                    ? "linear-gradient(135deg, #10b981, #059669)"
                                                    : "#0f172a",
                                                color: "#fff", fontSize: 14, fontWeight: 700,
                                                transition: "opacity .15s",
                                            }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                                        >
                                            Select Plan
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
          Confirmation Modal
          ════════════════════════════════════════════════════════════ */}
            {confirmPlan && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget && !assigning) setConfirmPlan(null); }}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 999, padding: "20px 16px",
                    }}
                >
                    <div style={{
                        width: "100%", maxWidth: 420, background: "#fff", borderRadius: 18,
                        boxShadow: "0 24px 60px rgba(0,0,0,.2)", overflow: "hidden",
                    }}>
                        {/* Icon header */}
                        <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                                background: "linear-gradient(135deg, #d1fae5, #cffafe)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                Confirm Plan Selection
                            </h2>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.6 }}>
                                You're about to assign <strong style={{ color: "#0f172a" }}>{confirmPlan.name}</strong> to this branch.
                            </p>
                        </div>

                        {/* Plan summary */}
                        <div style={{ margin: "20px 28px", padding: "14px 16px", background: "#f8fffe", border: "1.5px solid #d1fae5", borderRadius: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{confirmPlan.name}</span>
                                <span style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>
                                    ₹{((billingCycle === "monthly" ? confirmPlan.monthlyPrice : confirmPlan.yearlyPrice) ?? 0).toLocaleString("en-IN")}
                                    <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>
                                {confirmPlan.features?.length || 0} features included
                            </p>
                        </div>

                        {/* Warning if replacing existing plan */}
                        {currentPlan?.status === "active" && (
                            <div style={{
                                margin: "0 28px 20px", padding: "10px 14px",
                                background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10,
                                display: "flex", gap: 8, alignItems: "flex-start",
                            }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                                    This branch's current active plan will be marked <strong>expired</strong> and replaced with this one.
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{
                            padding: "16px 28px 24px", display: "flex", gap: 10, justifyContent: "flex-end",
                            borderTop: "1px solid #f1f5f9",
                        }}>
                            <SecondaryButton title="Cancel" onClick={() => setConfirmPlan(null)} />
                            <PrimaryButton
                                title={assigning ? "Assigning…" : "Confirm & Assign"}
                                disabled={assigning}
                                onClick={handleConfirmAssign}
                                icon={
                                    assigning
                                        ? <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
                                            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
      `}</style>
        </div>
    );
}