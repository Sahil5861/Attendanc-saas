"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/common/EmptyState";
import Table from "@/components/user/table";
import RolePermissionsView from "@/components/role/role-permissions-view";
import { getUsers, updateUserStatus, updateRolePermissions, deletePermission } from "@/services/super-admin.service";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useDispatch } from "react-redux";


interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: boolean;
}
export default function UsersPage() {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);

    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingRole, setViewingRole] = useState<any>(null); // ← new

    const dispatch = useDispatch();


    useEffect(() => { fetchUsers(); }, []);

    const handleStatusToggle = async (user: User) => {
        try {
            const res = await updateUserStatus(user._id);

            setUsers(prev =>
                prev.map(item =>
                    item._id === user._id
                        ? { ...item, status: !item.status }
                        : item
                )
            );

            toast.success(res.data.message);
        } catch (error) {
            console.error(error);
        }
    };



    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers();
            setUsers(response.data.data || []);

            // console.log('res : ', response.data.data);

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
            setUsers(prev => prev.filter((item: any) => item._id !== selectedRole._id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        } finally {
            setConfirmOpen(false);
            setSelectedRole(null);
        }
    };

    const handleDelete = (company: any) => { setSelectedRole(company); setConfirmOpen(true); };

    return (
        <>
            {users.length === 0 ? (
                <EmptyState title="No Users Found" subTitle="Create New User" buttonText="Add" onCreate={handleCreate} />
            ) : (
                <Table
                    users={users}
                    onCreate={handleCreate}
                    onDelete={handleDelete}
                    onView={handleView}   // ← pass karo
                    onStatusChange={handleStatusToggle}
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