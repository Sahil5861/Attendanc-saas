"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/feature/empty-state";
import Table from "@/components/feature/feature-table";
import FeatureModal from "@/components/feature/feature-modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getFeatures, createFeature, updateFeature, deleteFeature } from "@/services/super-admin.service";
import toast from "react-hot-toast";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  type: "",
  value: "",
  monthlyPrice: "",
  yearlyPrice: "",
  status: true
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { fetchFeatures(); }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await getFeatures();
      setFeatures(response.data.data || []);
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // ── Create ──
  const handleCreate = () => {
    setSelectedFeature(null);
    setForm(defaultForm);
    setOpen(true);
  };

  // ── Edit — pre-fill form ──
  const handleEdit = (feature: any) => {
    setSelectedFeature(feature);
    setForm({
      name:          feature.name        || "",
      slug:          feature.slug        || "",
      description:   feature.description || "",
      type: feature.type || "",
      value : feature.value || '',
      monthlyPrice:  feature.monthlyPrice  ?? 0,
      yearlyPrice:   feature.yearlyPrice   ?? 0,
      status:        feature.status        ?? true,
    });
    setOpen(true);
  };

  // ── Submit (create or update) ──
  const handleSubmit = async () => {
    try {
      if (selectedFeature) {
        await updateFeature(selectedFeature._id, form);
        toast.success("Feature updated");
      } else {
        await createFeature(form);
        toast.success("Feature created");
      }
      setOpen(false);
      setSelectedFeature(null);
      setForm(defaultForm);
      fetchFeatures();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  // ── Delete ──
  const handleDelete = (feature: any) => {
    setSelectedFeature(feature);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFeature) return;
    try {
      await deleteFeature(selectedFeature._id);
      toast.success("Feature deleted");
      setFeatures(prev => prev.filter((f: any) => f._id !== selectedFeature._id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    } finally {
      setConfirmOpen(false);
      setSelectedFeature(null);
    }
  };

  return (
    <>
      {features.length === 0 && !loading ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <Table
          features={features}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <FeatureModal
        open={open}
        form={form}
        setForm={setForm}
        mode={selectedFeature ? "edit" : "create"}
        onClose={() => { setOpen(false); setSelectedFeature(null); setForm(defaultForm); }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Feature"
        message={`Are you sure you want to delete "${selectedFeature?.name || ""}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setSelectedFeature(null); }}
      />
    </>
  );
}