"use client";

import { useState, useEffect } from "react";

import EmptyState from "@/components/common/EmptyState";
import Table from "@/components/department/table";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useRouter } from "next/navigation";


import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { usePermission } from "@/hooks/usePermission";
import Modal from "@/components/department/modal";
import { updateDepartments, createDepartments, getDepartments, deleteDepartments } from "@/services/branch.service";

interface Departments {
    _id: string;
    title: string;
    slug:string;
    status: boolean;
}

const defaultForm:any = {
    title: "",
    slug: "",
    status: true,
}



export default function EmployeePage() {

    const { can, initialized } = usePermission();

    const router = useRouter();
    
    const permissiosn = useSelector((state:RootState) => state.auth.permissions)


    // useEffect(() => {

    //     if (!initialized) return;
    
    //     if (!can("designation.view")) {
    //         router.replace("/unauthorized");
    //     }   
                
    // }, []);

    const user = useSelector((state: RootState) => state.auth.user);
    const plan = useSelector((state: RootState) => state.auth.plan);
    
    const branchId = user?.branchId;

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [form, setForm] = useState(defaultForm);

    const [selectedDepartments, setSelectedDepartments] = useState<Departments | null>(null);



    const [designation, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBranches = async () => {
            await fetchDepartments();
        };

        loadBranches();
    }, []);

    const fetchDepartments = async () => {

        try {
            setLoading(true);
            const response = await getDepartments();

            
            
            if (response.data?.success == true) {
                
                
                const data = response.data;
                console.log('data : ', data);
                setDepartments(data?.data || [])
            }

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
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }
        try {
            if (mode === "edit" && selectedDepartments) {
                await updateDepartments(selectedDepartments._id, form);
                toast.success("Departments updated successfully");
            } else {
                await createDepartments(form);
                toast.success("Departments added successfully");
            }
            setOpen(false);
            setSelectedDepartments(null);
            setForm(defaultForm);
            fetchDepartments();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };

    const handleCreate = () => {

        setMode("create");
        setSelectedDepartments(null);

        setOpen(true);
    };

    const handleEdit = (designation: any) => {
        setMode("edit");

        setSelectedDepartments(designation);

        setForm({
            title: designation.title || '',
            slug: designation.slug || '',
            status: designation.status || false,
        });

        setOpen(true);
    };

    const confirmDelete = async () => {

        if (!selectedDepartments) return;

        try {

            const response = await deleteDepartments(
                selectedDepartments._id
            );

            toast.success(response.data.message);

            setDepartments(prev =>
                prev.filter(
                    (item : any)=>
                        item._id !== selectedDepartments._id
                )
            );

        } catch (error: any) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete company"
            );

        } finally {

            setConfirmOpen(false);
            setSelectedDepartments(null);

        }
    };

    const handleDelete = async (company: any) => {

        setSelectedDepartments(company)
        setConfirmOpen(true);        
    };

    return (
        <>
            {
                designation.length === 0 ? (
                    <EmptyState
                        title="No Departments Found"                                        
                        buttonText="Add"
                        onCreate={handleCreate}
                    />
                ) : (
                    <Table
                        designation={designation}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )
            }

            <Modal
                open={open}
                mode={mode}
                form={form}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedDepartments(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Departments"
                message={`Are you sure you want to delete ${`${selectedDepartments?.title}` || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedDepartments(null);
                }}
            />
        </>
    );
}
