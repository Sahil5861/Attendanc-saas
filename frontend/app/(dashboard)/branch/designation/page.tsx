"use client";

import { useState, useEffect } from "react";

import EmptyState from "@/components/common/EmptyState";
import Table from "@/components/designation/table";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useRouter } from "next/navigation";


import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { usePermission } from "@/hooks/usePermission";
import Modal from "@/components/designation/modal";
import { updateemployee, createemployee, getEmployees, deleteEmployee, updateDesignations, createDesignations, getDesignations, deleteDesignations } from "@/services/branch.service";
import { BriefcaseBusiness } from "lucide-react";

interface Designation {
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

    const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);



    const [designation, setDesignation] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBranches = async () => {
            await fetchDesignations();
        };

        loadBranches();
    }, []);

    const fetchDesignations = async () => {

        try {
            setLoading(true);
            const response = await getDesignations();

            
            
            if (response.data?.success == true) {
                
                
                const data = response.data;
                console.log('data : ', data);
                setDesignation(data?.data || [])
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
            if (mode === "edit" && selectedDesignation) {
                await updateDesignations(selectedDesignation._id, form);
                toast.success("Designation updated successfully");
            } else {
                await createDesignations(form);
                toast.success("Designation added successfully");
            }
            setOpen(false);
            setSelectedDesignation(null);
            setForm(defaultForm);
            fetchDesignations();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };

    const handleCreate = () => {

        setMode("create");
        setSelectedDesignation(null);

        setOpen(true);
    };

    const handleEdit = (designation: any) => {
        setMode("edit");

        setSelectedDesignation(designation);

        setForm({
            title: designation.title || '',
            slug: designation.slug || '',
            status: designation.status || false,
        });

        setOpen(true);
    };

    const confirmDelete = async () => {

        if (!selectedDesignation) return;

        try {

            const response = await deleteDesignations(
                selectedDesignation._id
            );

            toast.success(response.data.message);

            setDesignation(prev =>
                prev.filter(
                    (item : any)=>
                        item._id !== selectedDesignation._id
                )
            );

        } catch (error: any) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete company"
            );

        } finally {

            setConfirmOpen(false);
            setSelectedDesignation(null);

        }
    };

    const handleDelete = async (company: any) => {

        setSelectedDesignation(company)
        setConfirmOpen(true);        
    };

    return (
        <>
            {
                designation.length === 0 ? (
                    <EmptyState
                        title="No Designations Found"                                        
                        buttonText="Add"
                        onCreate={handleCreate}
                        icon={<BriefcaseBusiness className="h-full w-full"/>}
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
                onClose={() => { setOpen(false); setSelectedDesignation(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Designation"
                message={`Are you sure you want to delete ${`${selectedDesignation?.title}` || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedDesignation(null);
                }}
            />
        </>
    );
}
