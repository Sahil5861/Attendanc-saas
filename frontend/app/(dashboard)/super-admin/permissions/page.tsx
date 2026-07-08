"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PermissionTable from "@/components/permission/permission-table";
import PermissionEmptyState from "@/components/permission/empty-state";
import PermissionModal from "@/components/permission/permission-modal";

import ConfirmDialog from "@/components/common/ConfirmDialog";

import {
  getAllPermissions,
  deletePermission,
  createPermission,
} from "@/services/super-admin.service";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  
  const [openPermissionModal, setOpenPermissionModal] = useState(false);

  const [form, setForm] = useState({
    action: "",
    module: "",
    description: "",
  });
  
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const response = await getAllPermissions();

      setPermissions(response.data.data || []);

      console.log('res : ', response);
      
    } catch (error) {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {

      const payload = {
        name: `${form.module.toLowerCase()}.${form.action}`,
        module: form.module,
        description: form.description,
      };
      await createPermission(payload);

      toast.success("Permission created");

      setOpenPermissionModal(false);

      setForm({
        action: "",
        module: "",
        description: "",
      });

      fetchPermissions();
    } catch (error) {
      toast.error("Failed to create permission");
    }
  };

  const handleCreate = () => {
    setSelectedPermission(null);
    setOpen(true);
  };

  const handleEdit = (permission: any) => {
    setSelectedPermission(permission);
    setOpen(true);
  };

  const handleDelete = (permission: any) => {
    setSelectedPermission(permission);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPermission) return;

    try {
      const response = await deletePermission(
        selectedPermission._id
      );

      toast.success(response.data.message);

      setPermissions((prev: any) =>
        prev.filter(
          (item: any) =>
            item._id !== selectedPermission._id
        )
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete permission"
      );
    } finally {
      setConfirmOpen(false);
      setSelectedPermission(null);
    }
  };

  return (
    <>
      {permissions.length === 0 ? (
        <PermissionEmptyState
          onCreate={handleCreate}
        />
      ) : (
        <PermissionTable
          permissions={permissions}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenPermissionModal={() =>
            setOpenPermissionModal(true)
          }
        />
      )}
      

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Permission"
        message={`Are you sure you want to delete "${selectedPermission?.name || ""}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedPermission(null);
        }}
      />

      <PermissionModal
        open={openPermissionModal}
        form={form}
        setForm={setForm}
        onClose={() => setOpenPermissionModal(false)}
        onSubmit={handleCreatePermission}
      />
    </>
  );
}