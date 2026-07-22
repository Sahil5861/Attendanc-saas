"use client"

import { useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import toast from "react-hot-toast";
import Table from "@/components/holidays/table";
import Modal, { defaultForm } from "@/components/holidays/modal";
import { Holiday, Branch } from "@/components/interface";
import { createHoliday, deleteHoliday, getBranches, getHolidays, updateHoliday } from "@/services/company.service";
import { Briefcase, BriefcaseBusiness } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";


export default function HolidaysPage() {
    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");

    const [form, setForm] = useState<Holiday | null>(defaultForm);


    const fetchBranches = async () => {

        try {
            setLoading(true);
            const response = await getBranches();
            const data = response.data;
            setBranches(data.data || [])

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong !!');
        }
        finally {
            setLoading(false);
        }
    }


    const fetchHolidays = async () => {
        try {
            setLoading(true);

            const res = await getHolidays();
            if (res.data.success === true) {
                setHolidays(res.data.data);
            }
            else {
                toast.error('Failed to fetch Holidays');
            }

        } catch (error: any) {
            console.error(error.message);
        }
    }
    useEffect(() => {
        const loadBranches = async () => {
            await fetchBranches();
        };

        const loadHolidays = async () => {
            await fetchHolidays();
        }

        loadBranches();
        loadHolidays();
    }, []);

    const handleCreate = () => {
        setSelectedHoliday(null);
        setMode("create");
        setForm(defaultForm);
        setOpen(true);
    };

    const confirmDelete = async ()=>{
        if(!selectedHoliday) return;

        try {
            const response = await deleteHoliday(selectedHoliday._id);

            toast.success(response.data.message);

            setHolidays(prev =>
                prev.filter(
                    (item : any)=>
                        item._id !== selectedHoliday._id
                )
            );
        } catch (error:any) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete holiday"
            );
        }
        finally {
            
            setConfirmOpen(false);
            setSelectedHoliday(null);

        }
    };

    const resetForm = ()=>{
        setForm(defaultForm);
    }

    const handleEdit = (holiday: Holiday) => {
        setSelectedHoliday(holiday);
        setMode("edit");
        setForm(holiday);
        setOpen(true);
    };

    const handleDelete = async (holiday: any) => {
        setSelectedHoliday(holiday);
        setConfirmOpen(true);
    }

    const handleSubmit = async () => {
        if (!form?.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!form?.date) {
            toast.error("Date is required");
            return;
        }

        setLoading(true);
        try {
            // TODO: replace with real API calls
            if (mode === "edit" && selectedHoliday) {
                await updateHoliday(selectedHoliday._id, form);
                setHolidays((prev) =>
                    prev.map((h) => (h._id === selectedHoliday._id ? { ...h, ...form } : h))
                );

                toast.success("Holiday updated");
            } else {
                const newHoliday: Holiday = { ...form, _id: crypto.randomUUID() };

                await createHoliday(newHoliday);
                setHolidays((prev) => [...prev, newHoliday]);
                toast.success("Holiday created");
            }
            setOpen(false);
            setForm(defaultForm);
            setSelectedHoliday(null);
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {holidays.length === 0 ? (
                <EmptyState
                    title="No holidays yet"
                    subTitle="Create Holidays for all of your branches"
                    onCreate={handleCreate}
                    buttonText="Add"
                    icon={<BriefcaseBusiness className="h-full w-full" />}
                />
            ) : (
                <Table
                    holiday={holidays}
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}

                />
            )}

            <Modal
                mode={mode}
                open={open}
                form={form}
                setForm={setForm}
                onClose={() => {
                    setOpen(false);
                    setSelectedHoliday(null);
                    resetForm();
                }}
                onSubmit={handleSubmit}
                branches={branches}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Holiday"
                message={`Are you sure you want to delete ${`${selectedHoliday?.title}` || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedHoliday(null);
                }}
            />
        </>
    );
}