"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getBranchById
} from "@/services/company.service";
import Button from "@/components/common/Button";


interface Branch {
    branchOwnerName: string;
    branchName: string;
    location: string;
    city: string;
    state: string;
    mobileNumber: string;
    email: string;
    password: string;
    status?: boolean;
}


export default function CompanyViewPage() {
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;

    const [branch, setBranch] = useState<Branch | null>(null); 

    useEffect(() => {
        fetchBranch();
    }, [companyId]);

    const fetchBranch = async () => {
        try {
            const res = await getBranchById(companyId);
            setBranch(res.data.data);
        } catch {
            toast.error("Failed to load branch details");
        }
    };

    const isActive = branch?.status == true;

    return (
        <div style={{ padding: "0 0 40px" }}>

            {/* ── Back button ── */}


            <Button
                title="Back"
                type="success"
                outline
                onClick={() => router.back()}
                icon={
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                    >
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                }
            />

            {/* ── Company details card ── */}
            {branch && (
                <div style={{
                    background: "#fff",
                    border: "1.5px solid #d1fae5",
                    borderRadius: 16,
                    padding: "28px 32px",
                    marginTop:28,
                    marginBottom: 28,
                    boxShadow: "0 4px 24px rgba(16,185,129,.06)",
                    display: "flex", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 24,
                }}>

                    {/* Left: identity */}
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                            background: "linear-gradient(135deg, #d1fae5, #cffafe)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24, fontWeight: 800, color: "#065f46",
                        }}>
                            {branch.branchName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                    {branch.branchName}
                                </h1>
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 5,
                                    background: isActive ? "#dcfce7" : "#fef2f2",
                                    color: isActive ? "#15803d" : "#dc2626",
                                    fontSize: 11, fontWeight: 700,
                                    padding: "3px 10px", borderRadius: 99,
                                    border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
                                    letterSpacing: "0.05em", textTransform: "uppercase",
                                }}>
                                    <span style={{
                                        width: 6, height: 6, borderRadius: "50%",
                                        background: isActive ? "#16a34a" : "#dc2626",
                                    }} />
                                    {branch.status == true ? 'Active' : 'Deactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: contact info grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "16px 32px",
                    }}>
                        <InfoItem icon="ti-user" label="Owner" value={branch.branchOwnerName} />
                        <InfoItem icon="ti-phone" label="Phone" value={branch.mobileNumber} mono />
                        {branch.location && <InfoItem icon="ti-map-pin" label="Address" value={branch.location} />}
                    </div>
                </div>
            )}
          
        </div>
    );
}

// ── Helper components ──
function InfoItem({ icon, label, value, link, mono }: { icon: string; label: string; value?: string; link?: string; mono?: boolean }) {
    const content = (
        <p style={{ margin: 0, fontWeight: 600, color: link ? "#0891b2" : "#0f172a", fontSize: 14, fontFamily: mono ? "monospace" : undefined }}>
            {value || "—"}
        </p>
    );
    return (
        <div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 3px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                <i className={`ti ${icon}`} aria-hidden style={{ fontSize: 13 }} />
                {label}
            </p>
            {link ? <a href={link} style={{ textDecoration: "none" }}>{content}</a> : content}
        </div>
    );
}

const thStyle: React.CSSProperties = {
    padding: "14px 18px",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    background: "#f8fffe",
    borderBottom: "1.5px solid #d1fae5",
    textAlign: "left",
};