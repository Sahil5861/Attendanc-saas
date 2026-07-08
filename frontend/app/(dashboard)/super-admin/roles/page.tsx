"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/role/empty-state";
import Table from "@/components/role/role-table";
import Drawer from "@/components/role/role-drawer";
import Form from "@/components/role/role-form";
import RolePermissionsView from "@/components/role/role-permissions-view";
import { getRoles, getAllPermissions, updateRolePermissions, deletePermission } from "@/services/super-admin.service";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { getMe } from "@/services/auth.service";

export default function RolesPage() {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);

    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingRole, setViewingRole] = useState<any>(null); // ← new

    const dispatch = useDispatch();
    

    useEffect(() => { fetchRoles(); }, []);

    // Add fetch function
    const fetchAllPermissions = async () => {
        const res = await getAllPermissions();
        const perms = res.data.data || [];
        setAllPermissions(perms);
        return perms;
    };


    // Add update handler
    const handleUpdatePermissions = async (roleId: string, permissionIds: string[]) => {
        const response = await updateRolePermissions(roleId, permissionIds);

        const user_response = await getMe();
        console.log(response.data.data);
        
        dispatch(
            setAuth({                
                user: user_response.data.user,
                plan: user_response.data.plan,
                permissions: response.data.data.permissions,
            })
        );
        await fetchRoles(); // refresh roles list
        return response;
    };


    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await getRoles();
            setRoles(response.data.data || []);
        } catch (error) {
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => { setSelectedRole(null); setOpen(true); };    
    const handleView = (role: any) => setViewingRole(role); // ← new

    const confirmDelete = async () => {
        if (!selectedRole) return;
        try {
            const response = await deletePermission(selectedRole._id);
            toast.success(response.data.message);
            setRoles(prev => prev.filter((item : any)=> item._id !== selectedRole._id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        } finally {
            setConfirmOpen(false);
            setSelectedRole(null);
        }
    };

    const handleDelete = (company: any) => { setSelectedRole(company); setConfirmOpen(true); };

    // ── View mode: permissions page ──
    if (viewingRole) {
        return (
            <RolePermissionsView
                role={viewingRole}
                onBack={() => setViewingRole(null)}
                allPermissions={allPermissions}
                fetchAllPermissions={fetchAllPermissions}
                onUpdatePermissions={handleUpdatePermissions}
            />
        );
    }

    return (
        <>
            {roles.length === 0 ? (
                <EmptyState onCreate={handleCreate} />
            ) : (
                <Table
                    roles={roles}
                    onCreate={handleCreate}                   
                    onDelete={handleDelete}
                    onView={handleView}   // ← pass karo
                />
            )}            

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Role"
                message={`Are you sure you want to delete "${selectedRole?.name || ""}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setSelectedRole(null); }}
            />
        </>
    );
}