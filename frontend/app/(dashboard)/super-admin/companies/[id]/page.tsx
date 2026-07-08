"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getCompanyById,
    getBranchesByCompany,
    createBranch,
    updateBranch,
    deleteBranch,
} from "@/services/super-admin.service";
import BranchModal from "@/components/company/branch-modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/common/Button";
import PrimaryButton from "@/components/common/PrimaryButton";
import SearchInput from "@/components/common/SearchInput";

interface Company {
    _id: string;
    companyName: string;
    companyCode: string;
    ownerName: string;
    email: string;
    phone: string;
    status: boolean;
    address?: string;
    createdAt?: string;
}

interface Branch {
    _id: string;
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

const defaultForm = {
    branchOwnerName: "",
    branchName: "",
    location: "",
    city: "",
    state: "",
    mobileNumber: "",
    email: "",
    password: "",
    status: true,
};

export default function CompanyViewPage() {
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;

    const [company, setCompany] = useState<Company | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [form, setForm] = useState(defaultForm);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    // Delete confirm
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    useEffect(() => {
        fetchCompany();
        fetchBranches();
    }, [companyId]);

    const fetchCompany = async () => {
        try {
            const res = await getCompanyById(companyId);
            setCompany(res.data.data);
        } catch {
            toast.error("Failed to load company details");
        }
    };

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const res = await getBranchesByCompany(companyId);
            setBranches(res.data.data || []);
        } catch {
            toast.error("Failed to load branches");
        } finally {
            setLoading(false);
        }
    };

    // ── Create ──
    const handleCreate = () => {
        setSelectedBranch(null);
        setForm(defaultForm);
        setMode("create");
        setOpen(true);
    };

    // ── Edit ──
    const handleEdit = (branch: Branch) => {
        setSelectedBranch(branch);
        setForm({
            branchOwnerName: branch.branchOwnerName || "",
            branchName: branch.branchName || "",
            location: branch.location || "",
            city: branch.city || "",
            state: branch.state || "",
            mobileNumber: branch.mobileNumber || "",
            email: branch.email || "",
            password: branch.password || "",
            status: branch.status ?? true,
        });
        setMode("edit");
        setOpen(true);
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!form.branchName.trim() || !form.branchOwnerName.trim()) {
            toast.error("Branch name and owner name are required");
            return;
        }
        try {
            if (mode === "edit" && selectedBranch) {
                await updateBranch(selectedBranch._id, { ...form, companyId });
                toast.success("Branch updated successfully");
            } else {
                await createBranch({ ...form, companyId });
                toast.success("Branch added successfully");
            }
            setOpen(false);
            setSelectedBranch(null);
            setForm(defaultForm);
            fetchBranches();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };

    // ── Delete ──
    const handleDelete = (branch: Branch) => {
        setSelectedBranch(branch);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedBranch) return;
        try {
            await deleteBranch(selectedBranch._id);
            toast.success("Branch deleted");
            setBranches((prev) => prev.filter((b) => b._id !== selectedBranch._id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        } finally {
            setConfirmOpen(false);
            setSelectedBranch(null);
        }
    };

    const filteredBranches = branches.filter((b) =>
        [b.branchName, b.branchOwnerName, b.city, b.state]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const isActive = company?.status == true;

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
            {company && (
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
                            {company.companyName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                    {company.companyName}
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
                                    {company.status == true ? 'Active' : 'Deactive'}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0", letterSpacing: "0.05em" }}>
                                {company.companyCode}
                            </p>
                        </div>
                    </div>

                    {/* Right: contact info grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "16px 32px",
                    }}>
                        <InfoItem icon="ti-user" label="Owner" value={company.ownerName} />
                        <InfoItem icon="ti-mail" label="Email" value={company.email} link={`mailto:${company.email}`} />
                        <InfoItem icon="ti-phone" label="Phone" value={company.phone} mono />
                        {company.address && <InfoItem icon="ti-map-pin" label="Address" value={company.address} />}
                    </div>
                </div>
            )}

            {/* ── Branches header ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Branches
                    </h2>
                    <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                        {branches.length} {branches.length === 1 ? "branch" : "branches"} registered
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>                   
                    <SearchInput
                        value={search}
                        onChange={(value) => setSearch(value)}
                        placeholder="Search branches..."
                    />

                    <PrimaryButton
                        title="Add Branch"
                        onClick={handleCreate}
                        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>}
                    />
                </div>
            </div>

            {/* ── Branches table ── */}
            <div style={{
                background: "#fff",
                border: "1.5px solid #d1fae5",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(16,185,129,.06)",
            }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Branch</th>
                                <th style={thStyle}>Owner</th>
                                <th style={thStyle}>Location</th>
                                <th style={thStyle}>City / State</th>
                                <th style={thStyle}>Mobile</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
                                        Loading branches…
                                    </td>
                                </tr>
                            ) : filteredBranches.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
                                        <div style={{ fontSize: 32, marginBottom: 10 }}>🏬</div>
                                        <p style={{ fontWeight: 600, color: "#64748b", margin: "0 0 4px" }}>
                                            {branches.length === 0 ? "No branches yet" : "No branches found"}
                                        </p>
                                        <p style={{ fontSize: 13, margin: 0 }}>
                                            {branches.length === 0 ? "Add your first branch to get started" : "Try adjusting your search"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBranches.map((branch, i) => {
                                    const isHovered = hoveredRow === branch._id;
                                    const isLast = i === filteredBranches.length - 1;
                                    const branchActive = branch.status !== false;

                                    return (
                                        <tr
                                            key={branch._id}
                                            onMouseEnter={() => setHoveredRow(branch._id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            style={{
                                                borderBottom: isLast ? "none" : "1px solid #f0fdf4",
                                                background: isHovered ? "#f0fdf8" : "#fff",
                                                transition: "background .15s",
                                            }}
                                        >
                                            {/* Branch name */}
                                            <td style={{ padding: "16px 18px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                        background: "linear-gradient(135deg, #d1fae5, #cffafe)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 14, fontWeight: 800, color: "#0e7490",
                                                    }}>
                                                        {branch.branchName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14 }}>
                                                        {branch.branchName}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Owner */}
                                            <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 500 }}>
                                                {branch.branchOwnerName}
                                            </td>

                                            {/* Location */}
                                            <td style={{ padding: "16px 18px", color: "#64748b" }}>
                                                {branch.location}
                                            </td>

                                            {/* City / State */}
                                            <td style={{ padding: "16px 18px" }}>
                                                <p style={{ margin: 0, fontWeight: 600, color: "#334155", fontSize: 13 }}>{branch.city}</p>
                                                <p style={{ margin: "1px 0 0", fontSize: 12, color: "#94a3b8" }}>{branch.state}</p>
                                            </td>

                                            {/* Mobile */}
                                            <td style={{ padding: "16px 18px", color: "#64748b", fontFamily: "monospace", fontSize: 13 }}>
                                                {branch.mobileNumber}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: "16px 18px" }}>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: 5,
                                                    background: branchActive ? "#dcfce7" : "#fef2f2",
                                                    color: branchActive ? "#15803d" : "#dc2626",
                                                    fontSize: 11, fontWeight: 700,
                                                    padding: "4px 10px", borderRadius: 99,
                                                    border: `1px solid ${branchActive ? "#86efac" : "#fca5a5"}`,
                                                }}>
                                                    <span style={{
                                                        width: 6, height: 6, borderRadius: "50%",
                                                        background: branchActive ? "#16a34a" : "#dc2626",
                                                    }} />
                                                    {branchActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: "16px 18px", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                    <button
                                                        onClick={() => handleEdit(branch)}
                                                        style={{
                                                            background: isHovered ? "#f0fdf4" : "transparent",
                                                            border: "1.5px solid #d1fae5",
                                                            borderRadius: 8, padding: "6px 14px",
                                                            fontSize: 12, fontWeight: 600, color: "#059669",
                                                            cursor: "pointer", transition: "all .15s",
                                                            display: "flex", alignItems: "center", gap: 5,
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; e.currentTarget.style.borderColor = "#86efac"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = isHovered ? "#f0fdf4" : "transparent"; e.currentTarget.style.borderColor = "#d1fae5"; }}
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
                                                        </svg>
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(branch)}
                                                        style={{
                                                            background: "transparent",
                                                            border: "1.5px solid #fee2e2",
                                                            borderRadius: 8, padding: "6px 14px",
                                                            fontSize: 12, fontWeight: 600, color: "#dc2626",
                                                            cursor: "pointer", transition: "all .15s",
                                                            display: "flex", alignItems: "center", gap: 5,
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#fee2e2"; }}
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal & Confirm Dialog ── */}
            <BranchModal
                open={open}
                mode={mode}
                form={form}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedBranch(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Branch"
                message={`Are you sure you want to delete "${selectedBranch?.branchName || ""}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setSelectedBranch(null); }}
            />
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