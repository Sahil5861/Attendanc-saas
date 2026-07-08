"use client";

import { useState, useEffect } from "react";
import { getFeatures, getCompanies, getBranchesByCompany } from "@/services/super-admin.service";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

interface Feature {
  _id: string;
  name: string;
  slug: string;
  type: string;            // "limit" | "module" | ...
  status: boolean;
  value: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
}

interface Company {
  _id: string;
  companyName: string;
}

interface Branch {
  _id: string;
  branchName: string;
}

// What actually gets stored per selected feature on the form
// Matches the DB shape: { feature_id, type, limit, _id? }
// _id here is the relation sub-document's own id (only present when editing
// a plan that already has it from the DB) — NOT the feature's id.
interface PlanFeature {
  feature_id: string;
  type: string;
  limit?: string;
  _id?: string;
}

interface Props {
  open: boolean;
  mode?: "create" | "edit";
  form: {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    isCustom: boolean;
    status: boolean;
    features: PlanFeature[];     // ← array of { feature_id, type, limit }
    company_id?: string;
    branch_id?: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSubmit: () => void;
}

// Normalize feature_id which may arrive as a string or a Mongo-style { $oid }
function normalizeId(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.$oid) return val.$oid;
  return String(val);
}

export default function PlanModal({ open, mode = "create", form, setForm, onClose, onSubmit }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [featureSearch, setFeatureSearch] = useState("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // ── Load features ─────────────────────────────────────────────────────
  const loadFeatures = async () => {
    try {
      setLoadingFeatures(true);
      const res = await getFeatures();
      setFeatures(res.data.data || []);
    } catch {
      setFeatures([]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  // ── Load companies (only for custom plan) ────────────────────────────
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await getCompanies();
      setCompanies(res.data.data || []);
    } catch {
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // ── Load branches for a given company ────────────────────────────────
  const loadBranches = async (companyId: string) => {
    if (!companyId) { setBranches([]); return; }
    try {
      setLoadingBranches(true);
      const res = await getBranchesByCompany(companyId);
      setBranches(res.data.data || []);
    } catch {
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      loadFeatures();
      setFeatureSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open && form.isCustom) {
      loadCompanies();
      if (form.company_id) loadBranches(form.company_id);
    } else {
      setBranches([]);
    }
  }, [form.isCustom, open]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCompanyChange = (companyId: string) => {
    setForm((prev: any) => ({ ...prev, company_id: companyId, branch_id: "" }));
    setBranches([]);
    if (companyId) loadBranches(companyId);
  };

  const handlePlanTypeChange = (value: string) => {
    const isCustom = value === "true";
    setForm((prev: any) => ({
      ...prev,
      isCustom,
      ...(!isCustom && { company_id: "", branch_id: "" }),
    }));
  };

  // Recalculate monthly/yearly totals from a list of selected PlanFeature objects
  const recalcPrices = (selectedFeatures: PlanFeature[]) => {
    const selectedFeatureData = features.filter((f) =>
      selectedFeatures.some((sf) => normalizeId(sf.feature_id) === f._id)
    );
    const monthlyPrice = selectedFeatureData.reduce((sum, f) => sum + Number(f.monthlyPrice || 0), 0);
    const yearlyPrice  = selectedFeatureData.reduce((sum, f) => sum + Number(f.yearlyPrice || 0), 0);
    return { monthlyPrice, yearlyPrice };
  };

  // ── Toggle a single feature on/off ──────────────────────────────────────
  // Builds/removes a { feature_id, type, limit } object — matches DB shape.
  const toggleFeature = (feature: Feature) => {
    setForm((prev: any) => {
      const currentFeatures: PlanFeature[] = prev.features || [];
      const isSelected = currentFeatures.some((f) => normalizeId(f.feature_id) === feature._id);

      const nextFeatures: PlanFeature[] = isSelected
        ? currentFeatures.filter((f) => normalizeId(f.feature_id) !== feature._id)
        : [
            ...currentFeatures,
            {
              feature_id: feature._id,
              type: feature.type,
              // limit-type features always carry a limit key (blank until filled)
              limit: feature.type === "limit" ? "" : "",
            },
          ];

      return { ...prev, features: nextFeatures, ...recalcPrices(nextFeatures) };
    });
  };

  // ── Update the limit value for an already-selected limit feature ────────
  const updateFeatureLimit = (featureId: string, limit: string) => {
    setForm((prev: any) => ({
      ...prev,
      features: (prev.features || []).map((f: PlanFeature) =>
        normalizeId(f.feature_id) === featureId ? { ...f, limit } : f
      ),
    }));
  };

  // ── Select / Deselect all visible features ──────────────────────────────
  const toggleAll = () => {
    const visibleIds = filteredFeatures.map((f) => f._id);
    const currentFeatures: PlanFeature[] = form.features || [];
    const allSelected = visibleIds.every((id) =>
      currentFeatures.some((f) => normalizeId(f.feature_id) === id)
    );

    setForm((prev: any) => {
      let nextFeatures: PlanFeature[];

      if (allSelected) {
        // remove all visible
        nextFeatures = (prev.features || []).filter(
          (f: PlanFeature) => !visibleIds.includes(normalizeId(f.feature_id))
        );
      } else {
        // add any visible features not already selected
        const existingIds = new Set(
          (prev.features || []).map((f: PlanFeature) => normalizeId(f.feature_id))
        );
        const toAdd: PlanFeature[] = filteredFeatures
          .filter((f) => !existingIds.has(f._id))
          .map((f) => ({
            feature_id: f._id,
            type: f.type,
            limit: f.type === "limit" ? "" : "",
          }));
        nextFeatures = [...(prev.features || []), ...toAdd];
      }

      return { ...prev, features: nextFeatures, ...recalcPrices(nextFeatures) };
    });
  };

  // ── Derived ───────────────────────────────────────────────────────────
  const filteredFeatures = features.filter(
    (f) => f.status !== false && f.name.toLowerCase().includes(featureSearch.toLowerCase())
  );



  const selectedFeatures = form.features || [];

  console.log('selectedFeatures jjjjj' , selectedFeatures);
  
  const selectedCount = selectedFeatures.length;
  const selectedFeatureIds = selectedFeatures.map((f) => normalizeId(f.feature_id));

  if (!open) return null;

  // ── Shared styles ─────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #d1fae5",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 999, padding: "20px 16px",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 680,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        border: "1.5px solid #d1fae5",
      }}>

        {/* ── Header ── */}        
          <ModalHeader
            title={mode === "edit" ? "Edit Plan" : "Add New Plan"}
            subtitle={mode === "edit" ? "Update plan details and features" : "Fill in the details to create a new plan"}
            onClose={onClose}
          />
        {/* ── Scrollable body ── */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>

          {/* Row 1: Name + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <CustomInput
              label="Plan Name"
              onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Premium Plan"
              value={form.name}
            />
            <CustomSelect
              label="Plan Type"
              value={form.isCustom ? "true" : "false"}
              options={[
                { label: "Standard Plan", value: "false" },
                { label: "Custom Plan", value: "true" },
              ]}
              onChange={(e) => handlePlanTypeChange(e.target.value)}
            />
          </div>

          {/* ── Custom plan: Company + Branch ── */}
          {form.isCustom && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16,
              padding: "16px 18px",
              background: "#f0fdf4",
              borderRadius: 12,
              border: "1.5px solid #bbf7d0",
            }}>
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
                  textTransform: "uppercase", color: "#059669",
                  background: "#d1fae5", padding: "2px 8px", borderRadius: 20,
                }}>
                  Custom Plan
                </span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Assign this plan to a specific company and branch
                </span>
              </div>

              <CustomSelect
                label="Company"
                value={form.company_id}
                onChange={(e) => handleCompanyChange(e.target.value)}
                loading={loadingCompanies}
                loadingText="Loading companies…"
                options={[
                  { label: "— Select Company —", value: "" },
                  ...companies.map((c) => ({ label: c.companyName, value: c._id })),
                ]}
              />

              <CustomSelect
                label="Branch"
                value={form.branch_id}
                onChange={(e) => setForm((p: any) => ({ ...p, branch_id: String(e.target.value) }))}
                loading={loadingBranches}
                loadingText="Loading branches…"
                disabled={!form.company_id}
                options={[
                  {
                    label: !form.company_id ? "Select a company first" : "— Select Branch —",
                    value: "",
                  },
                  ...branches.map((b) => ({ label: b.branchName, value: b._id })),
                ]}
              />
            </div>
          )}

          {/* Row 2: Prices + Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <CustomInput
              label="Monthly Price"
              value={form.monthlyPrice}
              onChange={(e) => setForm((p: any) => ({ ...p, monthlyPrice: Number(e.target.value) }))}
              placeholder="499"
              readonly
            />
            <CustomInput
              label="Annual Price"
              placeholder=""
              value={form.yearlyPrice}
              readonly
              onChange={(e) => setForm((p: any) => ({ ...p, yearlyPrice: Number(e.target.value) }))}
            />
            <CustomSelect
              label="Status"
              value={form.status ? "true" : "false"}
              onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value === "true" }))}
              options={[
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
              placeholder="Enter plan description..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#d1fae5"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* ── Features ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <label style={{ ...labelStyle, margin: 0 }}>Features</label>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {selectedCount > 0 ? `${selectedCount} selected` : "No features selected"}
                </p>
              </div>
              {filteredFeatures.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  style={{ fontSize: 12, fontWeight: 600, background: "none", border: "none", color: "#059669", cursor: "pointer", padding: 0 }}
                >
                  {filteredFeatures.every((f) => selectedFeatureIds.includes(f._id)) ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search features..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Features grid */}
            <div style={{ border: "1.5px solid #d1fae5", borderRadius: 12, maxHeight: 320, overflowY: "auto", background: "#f8fffe" }}>
              {loadingFeatures ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  Loading features…
                </div>
              ) : filteredFeatures.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  {featureSearch ? "No features match your search" : "No features available"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                  {filteredFeatures.map((feature) => {
                    const selectedFeature = selectedFeatures.find(
                      (f) => normalizeId(f.feature_id) === feature._id
                    );
                    const isChecked = !!selectedFeature;
                    
                    const isLimitFeature = feature.type === "limit";
                    const limitMissing = isLimitFeature && isChecked && !selectedFeature?.limit;

                    return (
                      <div
                        key={feature._id}
                        onClick={() => toggleFeature(feature)}
                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                          isChecked
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 mt-0.5 ${
                          isChecked ? "bg-emerald-600 border-emerald-600" : "border-slate-300 bg-white"
                        }`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm ${isChecked ? "font-semibold text-emerald-700" : "text-slate-700"}`}>
                              {feature.name}

                              {isLimitFeature && (
                                <span> (upto {feature.value})</span>
                              )}
                            </p>
                            {isLimitFeature && (
                              <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">
                                Limit
                              </span>
                            )}
                          </div>

                          <div className="flex gap-3 mt-1 text-xs text-slate-500">
                            <span>₹{feature.monthlyPrice || 0}/month</span>
                            <span>₹{feature.yearlyPrice || 0}/year</span>
                          </div>

                          {/* Limit input — only when type is "limit" AND feature is checked */}
                          {/* {isLimitFeature && isChecked && (
                            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                min="1"
                                value={selectedFeature?.limit ?? ""}
                                onChange={(e) => updateFeatureLimit(feature._id, e.target.value)}
                                placeholder="Enter limit (e.g. 50)"
                                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                                  limitMissing
                                    ? "border-red-300 focus:ring-2 focus:ring-red-200"
                                    : "border-slate-300 focus:ring-2 focus:ring-emerald-500"
                                }`}
                              />
                              {limitMissing && (
                                <p className="text-[11px] text-red-500 mt-1">Limit value is required</p>
                              )}
                            </div>
                          )} */}

                          {isLimitFeature && (
                            <input type="hidden" value={selectedFeature?.limit ?? feature.value} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
          <ModalFooter
            onClose={onClose}
            onSubmit={onSubmit}
            title="Create Plan"
          />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}