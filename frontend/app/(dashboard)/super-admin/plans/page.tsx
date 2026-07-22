"use client";

import { useState, useEffect } from "react";
import Table from "@/components/plan/plan-table";
import PlanModal from "@/components/plan/plan-modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from "@/services/super-admin.service";
import toast from "react-hot-toast";
import EmptyState from "@/components/common/EmptyState";


const defaultForm = {
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isCustom: false,
    status: true,    
    features: [],
    company_id: "",
    branch_id: "",
};

const toPrice = (value: unknown) => {
    const price = Number(value);
    return Number.isFinite(price) ? price : 0;
};

const getPlanFeatureId = (feature: any) => {
    if (typeof feature === "string") return feature;
    if (typeof feature?.featureId === "object") return feature.featureId?._id;
    return feature?.featureId || feature?._id;
};




export default function PlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [form, setForm] = useState(defaultForm);
    const [mode, setMode] = useState<"create" | "edit">("create");

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await getAllPlans();
            setPlans(response.data.data || []);

            console.log(response.data.data);
            
        } catch {
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    // ── Create ──
    const handleCreate = () => {
        setSelectedPlan(null);
        setForm(defaultForm);
        setMode("create");
        setOpen(true);
    };

    // ── Edit — pre-fill form including features ──
    const handleEdit = (plan: any) => {
        setSelectedPlan(plan);
        setForm({
            name: plan.name || "",
            description: plan.description || "",
            monthlyPrice: plan.monthlyPrice ?? 0,
            yearlyPrice: plan.yearlyPrice ?? 0,
            isCustom: plan.isCustom ?? false,
            status: plan.status ?? true,           
            company_id: plan.company_id ?? "",
            branch_id: plan.branch_id ?? "",
            // features: (plan.features || []).map((feature : any) =>feature._id)

            features : (plan.features || []).map(
                (feature : any) => ({
                    feature_id : feature.feature_id?._id,
                    type: feature.type,
                    limit: feature.limit || '',
                    price: feature.price || '',
                })
            ),
        });
        setMode("edit");
        setOpen(true);
    };

    // ── Submit (create or update) ──
    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Plan name is required");
            return;
        }
        try {
            if (mode === "edit" && selectedPlan) {
                await updatePlan(selectedPlan._id, form);
                toast.success("Plan updated successfully");
            } else {
                await createPlan(form);
                toast.success("Plan created successfully");
            }
            setOpen(false);
            setSelectedPlan(null);
            setForm(defaultForm);
            fetchPlans();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };

    // ── Delete ──
    const handleDelete = (plan: any) => {
        setSelectedPlan(plan);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedPlan) return;
        try {
            await deletePlan(selectedPlan._id);
            toast.success("Plan deleted");
            setPlans((prev) => prev.filter((p: any) => p._id !== selectedPlan._id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        } finally {
            setConfirmOpen(false);
            setSelectedPlan(null);
        }
    };

    return (
        <>

            {plans.length == 0  ? (
                <EmptyState
                    title="No Plans Found"
                    subTitle="Create your first plan"
                    buttonText="Add"
                    onCreate={handleCreate}/>
            ) : (

                <Table
                    plans={plans}
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <PlanModal
                open={open}
                mode={mode}
                form={form}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedPlan(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Plan"
                message={`Are you sure you want to delete "${selectedPlan?.name || ""}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setSelectedPlan(null); }}
            />
        </>
    );
}
