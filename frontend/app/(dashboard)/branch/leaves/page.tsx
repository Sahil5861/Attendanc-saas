"use client"

import { useEffect, useState } from "react"
import EmptyState from "@/components/common/EmptyState";
import Table from "@/components/BranchLeave/table";
import Modal, { defaultForm } from "@/components/BranchLeave/modal";
import { createLeave, deleteLeave, getLeave } from "@/services/employee.service";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { RootState } from "@/store";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { getLeaves } from "@/services/branch.service";
import { BriefcaseBusiness, CalendarCheck } from "lucide-react";


export default function LeavePage() {

    const [loading, setLoading] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [selectedLeve, setSelectedLeave] = useState<any>(null);
    const [open, setOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [form, setForm] = useState(defaultForm);

    const fetchLeaves = async () => {
        try {
            // setLoading(true);

            console.log("Fetch Leaves called !!");
            

            const res = await getLeaves();
            setLeaves(res.data.data);
        } catch (error) {
            console.error("Error fetching leaves:", error);
        }
    };

    useEffect(() => {    
        fetchLeaves();
    }, []);

    const handleCreate = () => {
        setOpen(true)
        setSelectedLeave(null)
    }

    const confirmDelete = async()=>{
        if(!selectedLeve) return;

        try {
            await deleteLeave(selectedLeve._id);
            toast.success("Leave Deleted successfully !");

            setLeaves((prev) => prev.filter((l:any) => l._id != selectedLeve._id));

        }catch (error:any) {
            console.error(error);
            toast.error('Failed to delete');            
        }
        finally {
            setConfirmOpen(false);
            setSelectedLeave(null);   
        }

    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = {
                reason: form.reason,
                daysType: form.daysType,
                type: form.type,
                status: form.status,
                fromDate: form.fromDate,
                toDate: form.toDate,
                date: form.date
            }
            console.log('data : ', data);
            const res = await createLeave(data)

            setOpen(false);

            toast.success(res.data.message);
            setForm(defaultForm);
            await fetchLeaves();
        } catch (error) {
            toast.error('Server Error');
            console.error(error);
        }
    }

    const handleDelete = async (leave:any) => {
        setSelectedLeave(leave);        
        setConfirmOpen(true);
    }
    return (
        <>
            {
                leaves.length === 0 ? (
                    <EmptyState
                        title="No Leaves requested yet"
                        icon={<CalendarCheck className="h-full w-full"/>}
                        // buttonText="Add"
                        // onCreate={handleCreate}

                    />
                ) : (
                    <Table       
                                         
                        leaves={leaves}        
                    />
                )
            }

            <Modal
                open={open}
                form={form}
                mode={selectedLeve ? 'edit' : 'create'}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedLeave(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Feature"
                message={`Are you sure you want to delete "${selectedLeve?.reason || ""}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setSelectedLeave(null); }}
                />
        </>
    )
}