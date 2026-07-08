"use client";

import { useState, useEffect } from "react";

import EmptyState from "@/components/branch/empty-state";
import CompanyTable from "@/components/branch/branch-table";
import { createBranch, deleteBranch,getBranches, updateBranch } from "@/services/company.service";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useRouter } from "next/navigation";


import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { usePermission } from "@/hooks/usePermission";
import BranchModal from "@/components/branch/branch-modal";


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



export default function BranchesPage() {

    const { can, initialized } = usePermission();

    const router = useRouter();

    useEffect(() => {

        if (!initialized) return;
        
        if (!can("branch.view")) {
            router.replace("/unauthorized");
        }
    }, []);

    const user = useSelector(
        (state: RootState) => state.auth.user
    );

    const companyId = user?.companyId;

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [form, setForm] = useState({
                    branchOwnerName: "",
                    branchName: "",
                    location: "",
                    city: "",
                    state: "",
                    mobileNumber: "",
                    email: "",
                    password: "",
                    status: true,
                });

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [branches, setBranches] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBranches = async () => {
            await fetchBranches();
        };

        loadBranches();
    }, []);

    const fetchBranches = async () => {

        try {
            setLoading(true);
            const response = await getBranches();
            const data = response.data;
            setBranches(data.data || [])

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong !!');
        }
        finally {
            setLoading(false);
        }
    }

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
            setForm({
                    branchOwnerName: "",
                    branchName: "",
                    location: "",
                    city: "",
                    state: "",
                    mobileNumber: "",
                    email: "",
                    password: "",
                    status: true,
                });
            fetchBranches();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };

    const handleCreate = () => {

        setSelectedBranch(null);

        setOpen(true);
    };

    const handleView = (branch: any)=>{
        router.push(`/company/branches/${branch._id}`);
    }

    const handleEdit = (branch: any) => {
        setMode("edit");

        setSelectedBranch(branch);

        setForm({
            branchOwnerName: branch.branchOwnerName || "",
            branchName: branch.branchName || "",
            location: branch.location || "",
            city: branch.city || "",
            state: branch.state || "",
            mobileNumber: branch.mobileNumber || "",
            email: branch.email || "",
            password: "",
            status: branch.status ?? true,
        });

        setOpen(true);
    };

    const confirmDelete = async () => {

        if (!selectedBranch) return;

        try {

            const response = await deleteBranch(
                selectedBranch._id
            );

            toast.success(response.data.message);

            setBranches(prev =>
                prev.filter(
                    (item : any)=>
                        item._id !== selectedBranch._id
                )
            );

        } catch (error: any) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete company"
            );

        } finally {

            setConfirmOpen(false);
            setSelectedBranch(null);

        }
    };

    const handleDelete = async (company: any) => {

        setSelectedBranch(company)
        setConfirmOpen(true);        
    };

    return (
        <>
            {
                branches.length === 0 ? (
                    <EmptyState
                        onCreate={handleCreate}
                    />
                ) : (
                    <CompanyTable
                        branches={branches}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                    />
                )
            }

            <BranchModal
                open={open}
                mode={mode}
                form={form}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedBranch(null); setForm({
                    branchOwnerName: "",
                    branchName: "",
                    location: "",
                    city: "",
                    state: "",
                    mobileNumber: "",
                    email: "",
                    password: "",
                    status: true,
                }); }}
                onSubmit={handleSubmit}
            />
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Branch"
                message={`Are you sure you want to delete ${selectedBranch?.branchName || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedBranch(null);
                }}
            />
        </>
    );
}
