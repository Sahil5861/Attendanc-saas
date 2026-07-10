"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Plus,
    Edit2,
    Trash2,
    Store,
    CheckCircle2,
    XCircle,
} from "lucide-react";
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

interface State {
    _id: string;
    name: string;
    stateId: string;
}

interface City {
    _id: string;
    stateId: string;
    cityId: string;
    name: string;
}

interface Branch {
    _id: string;
    branchOwnerName: string;
    branchName: string;
    location: string;
    city: City;
    state: State;
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

    useEffect(() => {
        fetchCompany();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchBranches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

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
            city: branch.city?.cityId || "",
            state: branch.state?.stateId || "",
            mobileNumber: branch.mobileNumber || "",
            email: branch.email || "",
            password: "", // Fixed: never prefill an existing (hashed) password into an edit form
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

    // Fixed: city/state are objects ({_id, name, ...}), not strings — joining them
    // directly produced "[object Object]" in the search string, so searching by
    // city/state name silently never matched anything.
    const filteredBranches = branches.filter((b) =>
        [b.branchName, b.branchOwnerName, b.city?.name, b.state?.name]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const activeBranchCount = branches.filter((b) => b.status !== false).length;
    const inactiveBranchCount = branches.length - activeBranchCount;

    const isActive = company?.status === true;

    return (
        <div className="pb-10">
            {/* Back button */}
            <Button
                title="Back"
                type="success"
                outline
                onClick={() => router.back()}
                icon={<ArrowLeft size={16} />}
            />

            {/* Company details card */}
            {company && (
                <div className="mt-7 mb-7 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-emerald-100 bg-white p-7 shadow-[0_4px_24px_rgba(16,185,129,0.06)]">
                    <div className="flex items-center gap-4">
                        <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-2xl font-extrabold text-emerald-800">
                            {company.companyName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-extrabold text-slate-900">{company.companyName}</h1>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                        isActive
                                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                            : "border-red-300 bg-red-50 text-red-600"
                                    }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-red-600"}`} />
                                    {isActive ? "Active" : "Deactive"}
                                </span>
                            </div>
                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{company.companyCode}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                        <InfoItem icon={<Building2 size={13} />} label="Owner" value={company.ownerName} />
                        <InfoItem icon={<Mail size={13} />} label="Email" value={company.email} link={`mailto:${company.email}`} />
                        <InfoItem icon={<Phone size={13} />} label="Phone" value={company.phone} mono />
                        {company.address && <InfoItem icon={<MapPin size={13} />} label="Address" value={company.address} />}
                    </div>
                </div>
            )}

            {/* Branch stats */}
            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600">
                            <Store size={18} />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Branches</p>
                            <p className="text-xl font-extrabold text-slate-900">{branches.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={18} />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active</p>
                            <p className="text-xl font-extrabold text-slate-900">{activeBranchCount}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                            <XCircle size={18} />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inactive</p>
                            <p className="text-xl font-extrabold text-slate-900">{inactiveBranchCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branches header */}
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Branches</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        {branches.length} {branches.length === 1 ? "branch" : "branches"} registered
                    </p>
                </div>

                <div className="flex gap-2.5">
                    <SearchInput value={search} onChange={(value) => setSearch(value)} placeholder="Search branches..." />
                    <PrimaryButton title="Add Branch" onClick={handleCreate} icon={<Plus size={15} />} />
                </div>
            </div>

            {/* Branches table */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Branch</th>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Owner</th>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Location</th>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">City / State</th>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Mobile</th>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</th>
                                <th className="border-b border-emerald-100 bg-slate-50 px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8">
                                        <div className="space-y-3">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBranches.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        <div className="mb-2 text-3xl">🏬</div>
                                        <p className="mb-1 font-semibold text-slate-600">
                                            {branches.length === 0 ? "No branches yet" : "No branches found"}
                                        </p>
                                        <p className="text-sm">
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
                                            className={`transition-colors ${isLast ? "" : "border-b border-emerald-50"} ${isHovered ? "bg-emerald-50/40" : "bg-white"}`}
                                        >
                                            {/* Branch name */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-sm font-extrabold text-cyan-700">
                                                        {branch.branchName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p className="font-bold text-slate-900">{branch.branchName}</p>
                                                </div>
                                            </td>

                                            {/* Owner */}
                                            <td className="px-4 py-4 font-medium text-slate-700">{branch.branchOwnerName}</td>

                                            {/* Location */}
                                            <td className="px-4 py-4 text-slate-500">{branch.location || "—"}</td>

                                            {/* City / State */}
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-slate-700">{branch.city?.name || "—"}</p>
                                                <p className="mt-0.5 text-xs text-slate-400">{branch.state?.name || "—"}</p>
                                            </td>

                                            {/* Mobile */}
                                            <td className="px-4 py-4 font-mono text-xs text-slate-500">{branch.mobileNumber}</td>

                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                                                        branchActive
                                                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                                            : "border-red-300 bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${branchActive ? "bg-emerald-600" : "bg-red-600"}`} />
                                                    {branchActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(branch)}
                                                        className="flex items-center gap-1.5 rounded-lg border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                                                    >
                                                        <Edit2 size={13} /> Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(branch)}
                                                        className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={13} /> Delete
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

            {/* Modal & Confirm Dialog */}
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
function InfoItem({
    icon,
    label,
    value,
    link,
    mono,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    link?: string;
    mono?: boolean;
}) {
    const content = (
        <p className={`m-0 text-sm font-semibold ${link ? "text-cyan-600" : "text-slate-900"} ${mono ? "font-mono" : ""}`}>
            {value || "—"}
        </p>
    );

    return (
        <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {icon}
                {label}
            </p>
            {link ? <a href={link} className="no-underline">{content}</a> : content}
        </div>
    );
}