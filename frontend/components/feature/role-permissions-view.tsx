"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────
interface Permission {
  _id: string;
  name: string;        // "company.create"
  module: string;      // "Company"
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
  allPermissions?: Permission[];         // pass all available permissions from parent
  fetchAllPermissions?: () => Promise<Permission[]>;  // OR fetch internally
}

// ── Helpers ────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  create: { label: "Create", color: "#059669", bg: "#f0fdf4", border: "#86efac" },
  view:   { label: "Read",   color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  edit: { label: "Update", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  delete: { label: "Delete", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
};

const ALL_ACTIONS = ["create", "view", "edit", "delete"];

const MODULE_ICONS: Record<string, string> = {
  company:    "ti-building",
  companies:  "ti-building",
  user:       "ti-users",
  users:      "ti-users",
  employee:   "ti-user-check",
  employees:  "ti-user-check",
  attendance: "ti-calendar-check",
  payroll:    "ti-cash",
  branch:     "ti-map-pin",
  branches:   "ti-map-pin",
  role:       "ti-shield",
  roles:      "ti-shield",
  plan:       "ti-credit-card",
  plans:      "ti-credit-card",
  feature:    "ti-sparkles",
  features:   "ti-sparkles",
  report:     "ti-chart-bar",
  reports:    "ti-chart-bar",
  setting:    "ti-settings",
  settings:   "ti-settings",
  dashboard:  "ti-layout-dashboard",
};

function getModuleIcon(module: string) {
  return MODULE_ICONS[module.toLowerCase()] || "ti-lock";
}

// Parse "company.create" → { module: "company", action: "create" }
function parseName(name: string) {
  const parts = name.split(".");
  return {
    action: parts[parts.length - 1].toLowerCase(),
    module: parts.slice(0, -1).join(".").toLowerCase() || parts[0].toLowerCase(),
  };
}

// Group Permission[] by module
function groupPermissions(permissions: Permission[]) {
  const map: Record<string, Permission[]> = {};
  permissions.forEach(p => {
    const { module } = parseName(p.name);
    const key = p.module || module; // prefer API module field
    if (!map[key]) map[key] = [];
    map[key].push(p);
  });
  return map;
}

// ── Main ───────────────────────────────────────────────
export default function RolePermissionsView({
  role,
  onBack,
  onUpdatePermissions,
  allPermissions,
  fetchAllPermissions,
}: Props) {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // All available permissions in the system
  const [availablePerms, setAvailablePerms] = useState<Permission[]>(allPermissions || []);
  // Currently selected permission IDs (for edit mode)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set((role.permissions || []).map(p => p._id))
  );
  // Track original for dirty check
  const originalIds = new Set((role.permissions || []).map(p => p._id));

  const isSystem = role.isSystemRole === true || (role.isSystemRole as any) === "true";

  useEffect(() => {
    if (editMode && availablePerms.length === 0 && fetchAllPermissions) {
      fetchAllPermissions().then(setAvailablePerms).catch(() => toast.error("Failed to load permissions"));
    }
  }, [editMode]);

  // In view mode: show only assigned; in edit mode: show all available
  const basePerms = editMode ? availablePerms : (role.permissions || []);
  const grouped = groupPermissions(basePerms);
  const allModules = Object.keys(grouped).sort();

  const filtered = allModules.filter(mod => {
    const matchesSearch = mod.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterAction === "all") return true;
    return grouped[mod].some(p => parseName(p.name).action === filterAction);
  });

  const totalAssigned = selectedIds.size;
  const totalModules = Object.keys(groupPermissions(role.permissions || [])).length;
  const isDirty = editMode && (
    selectedIds.size !== originalIds.size ||
    [...selectedIds].some(id => !originalIds.has(id))
  );

  const togglePermission = (permId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModule = (mod: string, forceOn?: boolean) => {
    const modPerms = grouped[mod] || [];
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = modPerms.every(p => next.has(p._id));
      modPerms.forEach(p => {
        if (forceOn !== undefined ? forceOn : !allSelected) next.add(p._id);
        else next.delete(p._id);
      });
      return next;
    });
  };

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
    setSelectedIds(new Set((role.permissions || []).map(p => p._id)));
    setEditMode(false);
  };

  return (
    <div style={{ padding: "0 0 40px" }}>

      {/* ── Back + Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#fff", border: "1.5px solid #d1fae5",
            borderRadius: 10, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, color: "#059669",
            cursor: "pointer", transition: "all .15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Roles
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13 }}>
          <span style={{ cursor: "pointer" }} onClick={onBack}>Roles</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{role.name}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          <span>Permissions</span>
        </div>
      </div>

      {/* ── Hero header ── */}
      <div style={{
        background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 16,
        padding: "24px 28px", marginBottom: 24,
        boxShadow: "0 4px 24px rgba(16,185,129,.06)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20
      }}>
        {/* Left: avatar + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #d1fae5, #cffafe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#065f46"
          }}>
            {role.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{role.name}</h1>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: isSystem ? "#eff6ff" : "#f0fdf4",
                color: isSystem ? "#1d4ed8" : "#15803d",
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                border: `1px solid ${isSystem ? "#bfdbfe" : "#86efac"}`,
                letterSpacing: "0.05em", textTransform: "uppercase"
              }}>
                {isSystem ? (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ) : null}
                {isSystem ? "System" : "Custom"}
              </span>
              {editMode && (
                <span style={{
                  background: "#fffbeb", color: "#d97706", fontSize: 11, fontWeight: 700,
                  padding: "3px 9px", borderRadius: 99, border: "1px solid #fde68a",
                  letterSpacing: "0.05em", textTransform: "uppercase"
                }}>
                  Editing
                </span>
              )}
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "5px 0 0" }}>
              {editMode ? "Select or deselect permissions for this role" : "Role permissions and access control"}
            </p>
          </div>
        </div>

        {/* Right: stats + edit button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Assigned", value: editMode ? selectedIds.size : totalAssigned, color: "#059669", bg: "#f0fdf4", border: "#d1fae5" },
              { label: "Modules",  value: totalModules, color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: stat.bg, border: `1.5px solid ${stat.border}`,
                borderRadius: 12, padding: "12px 18px", textAlign: "center", minWidth: 90
              }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0", fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Edit / Save / Cancel */}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "linear-gradient(135deg, #059669, #0891b2)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 20px", fontSize: 13, fontWeight: 700,
                cursor: "pointer", transition: "all .2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(5,150,105,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
              Edit Permissions
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleCancel}
                style={{
                  background: "#fff", border: "1.5px solid #e2e8f0",
                  borderRadius: 10, padding: "9px 18px",
                  fontSize: 13, fontWeight: 600, color: "#64748b",
                  cursor: "pointer", transition: "all .15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: isDirty ? "linear-gradient(135deg, #059669, #0891b2)" : "#e2e8f0",
                  color: isDirty ? "#fff" : "#94a3b8",
                  border: "none", borderRadius: 10, padding: "9px 20px",
                  fontSize: 13, fontWeight: 700,
                  cursor: (saving || !isDirty) ? "not-allowed" : "pointer",
                  transition: "all .2s", opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Filters row ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text" placeholder="Search modules…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9,
              border: "1.5px solid #d1fae5", borderRadius: 10, fontSize: 13, outline: "none",
              color: "#0f172a", background: "#fff", boxSizing: "border-box"
            }}
            onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#d1fae5"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", ...ALL_ACTIONS].map(action => {
            const cfg = action === "all"
              ? { label: "All", color: "#059669", bg: "#f0fdf4", border: "#86efac" }
              : ACTION_CONFIG[action];
            const isActive = filterAction === action;
            return (
              <button key={action} onClick={() => setFilterAction(action)} style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
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

        {/* Select All / Deselect All in edit mode */}
        {editMode && (
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              onClick={() => setSelectedIds(new Set(availablePerms.map(p => p._id)))}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", border: "1.5px solid #d1fae5",
                background: "#f0fdf4", color: "#059669", transition: "all .15s"
              }}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", border: "1.5px solid #fee2e2",
                background: "#fef2f2", color: "#dc2626", transition: "all .15s"
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{
          background: "#fff", border: "1.5px solid #d1fae5", borderRadius: 16,
          padding: "60px 24px", textAlign: "center",
          boxShadow: "0 4px 24px rgba(16,185,129,.06)"
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <p style={{ fontWeight: 700, color: "#64748b", fontSize: 15, margin: "0 0 4px" }}>No permissions found</p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            {basePerms.length === 0 ? "This role has no permissions assigned yet." : "Try adjusting your search or filter."}
          </p>
        </div>
      )}

      {/* ── Module cards grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
        {filtered.map(module => {
          const modPerms = grouped[module] || [];
          const allSelected = modPerms.every(p => selectedIds.has(p._id));
          const someSelected = modPerms.some(p => selectedIds.has(p._id));
          const hasAllActions = ALL_ACTIONS.every(a => modPerms.some(p => parseName(p.name).action === a));
          // In view mode, only show assigned
          const displayPerms = editMode ? modPerms : modPerms.filter(p => selectedIds.has(p._id) || (role.permissions || []).some(rp => rp._id === p._id));

          return (
            <div
              key={module}
              style={{
                background: "#fff",
                border: `1.5px solid ${editMode && someSelected ? "#86efac" : "#d1fae5"}`,
                borderRadius: 14, overflow: "hidden",
                boxShadow: editMode && someSelected ? "0 4px 20px rgba(16,185,129,.08)" : "0 2px 12px rgba(16,185,129,.04)",
                transition: "all .2s"
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(16,185,129,.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = editMode && someSelected ? "0 4px 20px rgba(16,185,129,.08)" : "0 2px 12px rgba(16,185,129,.04)"; }}
            >
              {/* Card header */}
              <div style={{
                padding: "14px 18px", borderBottom: "1.5px solid #f0fdf4",
                background: editMode && someSelected ? "#f0fdf8" : "#f8fffe",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "linear-gradient(135deg, #d1fae5, #cffafe)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "#065f46"
                  }}>
                    <i className={`ti ${getModuleIcon(module)}`} aria-hidden />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 14, textTransform: "capitalize" }}>
                      {module}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "1px 0 0" }}>
                      {editMode
                        ? `${modPerms.filter(p => selectedIds.has(p._id)).length} of ${modPerms.length} selected`
                        : `${modPerms.length} of ${ALL_ACTIONS.length} actions`
                      }
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {!editMode && hasAllActions && (
                    <span style={{
                      background: "#dcfce7", color: "#15803d", fontSize: 10, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 99, border: "1px solid #86efac",
                      letterSpacing: "0.06em", textTransform: "uppercase"
                    }}>
                      Full Access
                    </span>
                  )}

                  {/* Module toggle checkbox in edit mode */}
                  {editMode && (
                    <button
                      onClick={() => toggleModule(module)}
                      title={allSelected ? "Deselect all in module" : "Select all in module"}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: allSelected ? "#dcfce7" : "#fff",
                        border: `1.5px solid ${allSelected ? "#86efac" : "#e2e8f0"}`,
                        borderRadius: 7, padding: "4px 10px",
                        fontSize: 11, fontWeight: 600,
                        color: allSelected ? "#059669" : "#94a3b8",
                        cursor: "pointer", transition: "all .15s"
                      }}
                    >
                      {allSelected ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                        </svg>
                      )}
                      {allSelected ? "All" : "Select all"}
                    </button>
                  )}
                </div>
              </div>

              {/* Permission pills / toggles */}
              <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_ACTIONS.map(action => {
                  const matchingPerm = modPerms.find(p => parseName(p.name).action === action);
                  const exists = !!matchingPerm;
                  const isSelected = exists && selectedIds.has(matchingPerm!._id);
                  const cfg = ACTION_CONFIG[action];

                  if (!editMode && !isSelected) {
                    // View mode: show greyed out if not assigned
                    return (
                      <span key={action} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 11px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                        border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#cbd5e1"
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        {cfg.label}
                      </span>
                    );
                  }

                  return editMode ? (
                    // Edit mode: clickable toggle
                    <button
                      key={action}
                      onClick={() => matchingPerm && togglePermission(matchingPerm._id)}
                      disabled={!exists}
                      title={!exists ? "Permission not available for this module" : matchingPerm?.description}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 11px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${isSelected ? cfg.border : exists ? "#e2e8f0" : "#f1f5f9"}`,
                        background: isSelected ? cfg.bg : exists ? "#fff" : "#f8fafc",
                        color: isSelected ? cfg.color : exists ? "#94a3b8" : "#e2e8f0",
                        cursor: exists ? "pointer" : "not-allowed",
                        transition: "all .15s",
                        outline: "none"
                      }}
                      onMouseEnter={e => { if (exists && !isSelected) { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.background = cfg.bg + "88"; } }}
                      onMouseLeave={e => { if (exists && !isSelected) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; } }}
                    >
                      {isSelected ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="9"/>
                          <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                      )}
                      {cfg.label}
                    </button>
                  ) : (
                    // View mode: assigned pill
                    <span key={action} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 11px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${cfg.border}`,
                      background: cfg.bg, color: cfg.color
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {cfg.label}
                    </span>
                  );
                })}
              </div>

              {/* Description tooltip row — only in edit mode on hover */}
              {editMode && modPerms.length > 0 && (
                <div style={{
                  padding: "0 18px 12px",
                  fontSize: 11, color: "#94a3b8", lineHeight: 1.5
                }}>
                  {modPerms.find(p => selectedIds.has(p._id))?.description && (
                    <p style={{ margin: 0 }}>
                      {modPerms.find(p => selectedIds.has(p._id))?.description}
                    </p>
                  )}
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