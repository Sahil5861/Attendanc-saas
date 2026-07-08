"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";

// ── Types ──────────────────────────────────────────────────────────────
interface Permission {
  _id: string;
  name: string;
  module: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  _id: string;
  name: string;
  isSystemRole: boolean;
  permissions?: Permission[];
}

interface Props {
  role: Role;
  onBack: () => void;
  onUpdatePermissions?: (roleId: string, permissionIds: string[]) => Promise<any>;
  allPermissions?: Permission[];
  fetchAllPermissions?: () => Promise<Permission[]>;
}

// ── Constants ──────────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  create: { label: "Create", color: "#059669", bg: "#f0fdf4", border: "#86efac" },
  edit:   { label: "Update", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  view:   { label: "Read",   color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  delete: { label: "Delete", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
  read: { label: "Read", color: "#6508b2", bg: "#fef2f2", border: "#d4bae9" },
};
const ALL_ACTIONS = ["create", "view", "edit", "delete", "read"];

const MODULE_ICONS: Record<string, string> = {
  company: "🏢", companies: "🏢",
  user: "👥", users: "👥",
  employee: "👤", employees: "👤",
  attendance: "📅",
  payroll: "💰",
  branch: "📍", branches: "📍",
  role: "🛡️", roles: "🛡️",
  plan: "💳", plans: "💳",
  feature: "✨", features: "✨",
  report: "📊", reports: "📊",
  setting: "⚙️", settings: "⚙️",
  dashboard: "🗂️",
};
function getModuleIcon(mod: string) {
  return MODULE_ICONS[mod.toLowerCase()] ?? "🔐";
}

function parseName(name: string) {
  const parts = name.split(".");
  return {
    action: parts[parts.length - 1].toLowerCase(),
    module: parts.slice(0, -1).join(".").toLowerCase() || parts[0].toLowerCase(),
  };
}

function groupPermissions(permissions: Permission[]) {
  const map: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    const key = p.module || parseName(p.name).module;
    if (!map[key]) map[key] = [];
    map[key].push(p);
  });
  return map;
}

// ── Component ──────────────────────────────────────────────────────────
export default function RolePermissionsView({
  role,
  onBack,
  onUpdatePermissions,
  allPermissions,
  fetchAllPermissions,
}: Props) {
  const [search, setSearch]           = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [editMode, setEditMode]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  const [availablePerms, setAvailablePerms] = useState<Permission[]>(allPermissions || []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set((role.permissions || []).map((p) => p._id))
  );
  const originalIds = new Set((role.permissions || []).map((p) => p._id));

  const isSystem = role.isSystemRole === true || (role.isSystemRole as any) === "true";

  // Load all permissions when entering edit mode
  useEffect(() => {
    if (editMode && availablePerms.length === 0 && fetchAllPermissions) {
      fetchAllPermissions()
        .then(setAvailablePerms)
        .catch(() => toast.error("Failed to load permissions"));
    }
  }, [editMode]);

  const basePerms = editMode ? availablePerms : (role.permissions || []);
  const grouped   = groupPermissions(basePerms);
  const allModules = Object.keys(grouped).sort();

  console.log('grouped : ', grouped);
  

  const filtered = allModules.filter((mod) => {
    if (!mod.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAction === "all") return true;
    return grouped[mod].some((p) => parseName(p.name).action === filterAction);
  });

  console.log('filtered :', filtered);
  

  const totalAssigned = (role.permissions || []).length;
  const totalModules  = Object.keys(groupPermissions(role.permissions || [])).length;

  // ── Toggle helpers ────────────────────────────────────────────────────
  const toggleAccordion = (mod: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });
  };

  const expandAll  = () => setOpenModules(new Set(filtered));
  const collapseAll = () => setOpenModules(new Set());

  const togglePermission = (permId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  const toggleModule = (mod: string) => {
    const modPerms   = grouped[mod] || [];
    const allSelected = modPerms.every((p) => selectedIds.has(p._id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      modPerms.forEach((p) => (allSelected ? next.delete(p._id) : next.add(p._id)));
      return next;
    });
  };

  const selectAllPerms  = () => setSelectedIds(new Set(availablePerms.map((p) => p._id)));
  const clearAllPerms   = () => setSelectedIds(new Set());

  // ── Save / Cancel ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!onUpdatePermissions) return;
    try {
      setSaving(true);
      await onUpdatePermissions(role._id, [...selectedIds]);
      toast.success("Permissions updated successfully");
      setEditMode(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedIds(new Set((role.permissions || []).map((p) => p._id)));
    setEditMode(false);
  };

  // ── Derived for "select all" top-level checkbox ───────────────────────
  const allVisiblePerms = filtered.flatMap((mod) => grouped[mod] || []);
  const allVisibleSelected = allVisiblePerms.length > 0 && allVisiblePerms.every((p) => selectedIds.has(p._id));
  const someVisibleSelected = allVisiblePerms.some((p) => selectedIds.has(p._id));

  const toggleAllVisible = () => {
    const ids = allVisiblePerms.map((p) => p._id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "0 0 48px", width: '100%' }}>

      {/* ── Back + Breadcrumb ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1.5px solid #d1fae5",
            borderRadius: 9, padding: "7px 15px",
            fontSize: 13, fontWeight: 600, color: "#059669",
            cursor: "pointer",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Roles
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 13 }}>
          <span style={{ cursor: "pointer" }} onClick={onBack}>Roles</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{role.name}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          <span>Permissions</span>
        </div>
      </div>

      {/* ── Hero header ───────────────────────────────────────────────── */}
      <div style={{
        background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 16,
        padding: "22px 26px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13, flexShrink: 0,
            background: "linear-gradient(135deg, #d1fae5, #cffafe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#065f46",
          }}>
            {role.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{role.name}</h1>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                border: `1px solid ${isSystem ? "#bfdbfe" : "#86efac"}`,
                background: isSystem ? "#eff6ff" : "#f0fdf4",
                color: isSystem ? "#1d4ed8" : "#15803d",
                letterSpacing: ".05em", textTransform: "uppercase",
              }}>
                {isSystem ? "System" : "Custom"}
              </span>
              {editMode && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
                  letterSpacing: ".05em", textTransform: "uppercase",
                }}>Editing</span>
              )}
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>
              {editMode
                ? "Select or deselect permissions for this role"
                : "Role permissions and access control"}
            </p>
          </div>
        </div>

        {/* Stats + action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Assigned", value: editMode ? selectedIds.size : totalAssigned, color: "#059669", bg: "#f0fdf4", border: "#d1fae5" },
            { label: "Modules",  value: totalModules, color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
          ].map((s) => (
            <div key={s.label} style={{
              background: s.bg, border: `1.5px solid ${s.border}`,
              borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 80,
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: "1px 0 0", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}

          {!editMode ? (
            <PrimaryButton
              title="Edit Permissions"
              onClick={() => setEditMode(true)}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
                </svg>
              }
            />
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <SecondaryButton title="Cancel" onClick={handleCancel} />
              <PrimaryButton
                title={saving ? "Saving…" : "Save Changes"}
                disabled={saving}
                onClick={handleSave}
                icon={
                  saving
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
          )}
        </div>
      </div>

      {/* ── Toolbar: search + action filter + expand/collapse ─────────── */}
      <div style={{
        background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 12,
        padding: "14px 18px", marginBottom: 4,
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text" placeholder="Search modules…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12, padding: "8px 12px 8px 32px",
              border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none",
              color: "#0f172a", background: "#f8fafc", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.background = "#fff"; }}
            onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
          />
        </div>

        {/* Action filters */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["all", ...ALL_ACTIONS].map((action) => {
            const cfg = action === "all"
              ? { label: "All", color: "#059669", bg: "#f0fdf4", border: "#86efac" }
              : ACTION_CONFIG[action];
            const isActive = filterAction === action;
            return (
              <button key={action} onClick={() => setFilterAction(action)} style={{
                padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all .15s",
                border: `1.5px solid ${isActive ? cfg.border : "#e2e8f0"}`,
                background: isActive ? cfg.bg : "#fff",
                color: isActive ? cfg.color : "#64748b",
              }}>
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse */}
        <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
          <button onClick={expandAll} style={{
            padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: "pointer", border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
          }}>
            Expand All
          </button>
          <button onClick={collapseAll} style={{
            padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: "pointer", border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
          }}>
            Collapse All
          </button>
        </div>
      </div>

      {/* ── Top-level "Check All" row (edit mode only) ─────────────────── */}
      {editMode && filtered.length > 0 && (
        <div style={{
          background: allVisibleSelected ? "#f0fdf4" : "#fafafa",
          border: "1.5px solid #d1fae5",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          padding: "11px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}>
          {/* Indeterminate-aware master checkbox */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div
              onClick={toggleAllVisible}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${allVisibleSelected ? "#059669" : someVisibleSelected ? "#059669" : "#cbd5e1"}`,
                background: allVisibleSelected ? "#059669" : someVisibleSelected ? "#d1fae5" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              {allVisibleSelected && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {!allVisibleSelected && someVisibleSelected && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Select all permissions
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              ({selectedIds.size} of {allVisiblePerms.length} selected)
            </span>
          </label>

          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={selectAllPerms} style={{
              padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              cursor: "pointer", border: "1.5px solid #d1fae5", background: "#f0fdf4", color: "#059669",
            }}>
              Select All
            </button>
            <button onClick={clearAllPerms} style={{
              padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              cursor: "pointer", border: "1.5px solid #fee2e2", background: "#fef2f2", color: "#dc2626",
            }}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div style={{
          background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 14,
          padding: "56px 24px", textAlign: "center", marginTop: 4,
        }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🔐</div>
          <p style={{ fontWeight: 700, color: "#64748b", fontSize: 15, margin: "0 0 4px" }}>No permissions found</p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            {basePerms.length === 0 ? "This role has no permissions assigned yet." : "Try adjusting your search or filter."}
          </p>
        </div>
      )}

      {/* ── Accordion ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {filtered.map((module, idx) => {
          const modPerms    = grouped[module] || [];
          const isOpen      = openModules.has(module);
          const allSelected = modPerms.every((p) => selectedIds.has(p._id));
          const someSelected = modPerms.some((p) => selectedIds.has(p._id));
          const assignedCount = editMode
            ? modPerms.filter((p) => selectedIds.has(p._id)).length
            : modPerms.filter((p) => originalIds.has(p._id)).length;
          const isFirst = idx === 0;
          const isLast  = idx === filtered.length - 1;

          return (
            <div
              key={module}
              style={{
                background: "#fff",
                border: "1.5px solid #d1fae5",
                borderTop: isFirst ? "1.5px solid #d1fae5" : "none",
                borderRadius: isFirst && isLast ? 12 : isFirst ? "12px 12px 0 0" : isLast ? "0 0 12px 12px" : 0,
                overflow: "hidden",
                transition: "all .2s",
              }}
            >
              {/* ── Accordion header ── */}
              <div
                onClick={() => toggleAccordion(module)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 18px",
                  cursor: "pointer",
                  background: isOpen ? "#f8fffe" : "#fff",
                  borderBottom: isOpen ? "1.5px solid #e6faf2" : "none",
                  userSelect: "none",
                  transition: "background .15s",
                }}
              >
                {/* Module toggle checkbox (edit mode) */}
                {editMode && (
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleModule(module); }}
                    style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${allSelected ? "#059669" : someSelected ? "#059669" : "#cbd5e1"}`,
                      background: allSelected ? "#059669" : someSelected ? "#d1fae5" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all .15s",
                    }}
                  >
                    {allSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {!allSelected && someSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Icon */}
                <span style={{ fontSize: 18, lineHeight: 1 }}>{getModuleIcon(module)}</span>

                {/* Name + subtitle */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "capitalize" }}>
                    {module}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 10 }}>
                    {editMode
                      ? `${assignedCount} of ${modPerms.length} selected`
                      : `${assignedCount} of ${ALL_ACTIONS.length} actions assigned`}
                  </span>
                </div>

                {/* Permission pills preview (collapsed, view mode) */}
                {!isOpen && !editMode && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {ALL_ACTIONS.map((action) => {
                      const perm = modPerms.find((p) => parseName(p.name).action === action);
                      const assigned = perm && originalIds.has(perm._id);
                      const cfg = ACTION_CONFIG[action];
                      return (
                        <span key={action} style={{
                          padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          border: `1.5px solid ${assigned ? cfg.border : "#e2e8f0"}`,
                          background: assigned ? cfg.bg : "#f8fafc",
                          color: assigned ? cfg.color : "#cbd5e1",
                        }}>
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Chevron */}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round"
                  style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* ── Accordion body ── */}
              {isOpen && (
                <div style={{ padding: "18px 22px", borderTop: "1px solid #f0fdf4" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ALL_ACTIONS.map((action) => {
                      const perm      = modPerms.find((p) => parseName(p.name).action === action);
                      const exists    = !!perm;
                      const isChecked = exists && (editMode ? selectedIds.has(perm!._id) : originalIds.has(perm!._id));
                      const cfg       = ACTION_CONFIG[action];

                      return (
                        <div
                          key={action}
                          onClick={() => editMode && exists && togglePermission(perm!._id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "11px 16px", borderRadius: 10,
                            border: `1.5px solid ${isChecked ? cfg.border : "#f1f5f9"}`,
                            background: isChecked ? cfg.bg : "#fafafa",
                            cursor: editMode && exists ? "pointer" : "default",
                            transition: "all .15s",
                            opacity: !exists ? 0.4 : 1,
                          }}
                        >
                          {/* Checkbox */}
                          {editMode ? (
                            <div style={{
                              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                              border: `2px solid ${isChecked ? cfg.color : "#cbd5e1"}`,
                              background: isChecked ? cfg.color : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all .15s",
                            }}>
                              {isChecked && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          ) : (
                            <div style={{
                              width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                              border: `2px solid ${isChecked ? cfg.color : "#e2e8f0"}`,
                              background: isChecked ? cfg.color : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {isChecked && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          )}

                          {/* Action label badge */}
                          <span style={{
                            padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                            border: `1.5px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
                            minWidth: 60, textAlign: "center",
                          }}>
                            {cfg.label}
                          </span>

                          {/* Description */}
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                              {perm?.name || `${module}.${action}`}
                            </p>
                            {perm?.description && (
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                                {perm.description}
                              </p>
                            )}
                          </div>

                          {/* Not available badge */}
                          {!exists && (
                            <span style={{
                              fontSize: 11, color: "#94a3b8", fontStyle: "italic",
                            }}>
                              Not available
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}