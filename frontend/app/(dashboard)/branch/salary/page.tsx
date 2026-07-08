"use client";

import { useState, useEffect } from "react";

import EmptyState from "@/components/common/EmptyState";
import Table from "@/components/salary/table";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { usePermission } from "@/hooks/usePermission";
import Modal, {defaultSalaryForm} from "@/components/salary/modal";
import { createEmployeeSalary, getEmployeeSalary, updateEmployeeSalary } from "@/services/employeeSalary";
import {uid} from "@/constants/helper"
import { deleteSalary } from "@/services/branch.service";


interface Salary {
    _id: string;
    title: string;
    employeeId: string;
    slug:string;
    status: boolean;
}

const defaultForm = {
    title: "",
    effectiveFrom: "",

    basicSalary: 0,
    hra: 0,
    conveyance: 0,
    medical: 0,
    specialAllowance: 0,
    bonus: 0,

    pf: 0,
    esi: 0,
    professionalTax: 0,
    tds: 0,
    otherDeduction: 0,

    status: true,
};



export default function SalaryPage() {
    
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [form, setForm] = useState(defaultForm);

    const [selecetdSalary, setSelectedSalary] = useState<Salary | null>(null);
    const [salaryForm, setSalaryForm] = useState(defaultSalaryForm);




    const [salaries, setSalaries] = useState([]);

    const [loading, setLoading] = useState(true);

    

    const fetchSalaries = async () => {

        try {
            setLoading(true);
            const response = await getEmployeeSalary();

            
            
            if (response.data?.success == true) {                            
                const data = response.data;
                setSalaries(data?.data || [])
            }

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong !!');
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const loadSalry = async () => {
            await fetchSalaries();
        };

        loadSalry();
    }, []);

    // ── Submit ──
    const handleSubmit = async () => {
        if (!salaryForm.basicSalary) {
            toast.error("Basic Salary is required");
            return;
        }
        try {
            if (mode === "edit" && selecetdSalary) {
                await updateEmployeeSalary(selecetdSalary._id, salaryForm);
                toast.success("Employee Salary updated successfully");
            } else {
                await createEmployeeSalary(salaryForm);
                toast.success("Employee Salary added successfully");
            }
            setOpen(false);
            setSelectedSalary(null);
            setForm(defaultForm);
            fetchSalaries();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        }
    };

    const handleCreate = () => {

        setMode("create");
        setSelectedSalary(null);

        setOpen(true);
    };

    const handleEdit = (salary: any) => {
        setMode("edit");

        setSelectedSalary(salary);

        setSalaryForm({
            employeeId: salary.employeeId._id,
            basicSalary: salary.basicSalary,
            earnings: salary.earnings.map((item:any) => ({
                id : uid(), 
                ...item
            })) ?? [],
            // deductions: salary.deductions ?? [],
            deductions: salary.deductions.map((item:any) => ({
                id: uid(),
                ...item
            })) ?? [],
            fines: salary.fines ?? [],
            note: salary.note ?? "",
        });

        setOpen(true);
    };

    const confirmDelete = async () => {

        if (!selecetdSalary) return;

        try {

            const response = await deleteSalary(
                selecetdSalary._id
            );

            toast.success(response.data.message);

            setSalaries(prev =>
                prev.filter(
                    (item : any)=>
                        item._id !== selecetdSalary._id
                )
            );

        } catch (error: any) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete company"
            );

        } finally {

            setConfirmOpen(false);
            setSelectedSalary(null);

        }
    };

    const handleDelete = async (company: any) => {

        setSelectedSalary(company)
        setConfirmOpen(true);        
    };

    return (
        <>
            {
                salaries.length === 0 ? (
                    <EmptyState
                        title="No Salary Added yet"                                        
                        buttonText="Add"
                        onCreate={handleCreate}
                    />
                ) : (
                    <Table
                        salaries={salaries}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )
            }

            <Modal
                open={open}
                mode={mode}
                form={salaryForm}
                setForm={setSalaryForm}
                onClose={() => { setOpen(false); setSelectedSalary(null); setSalaryForm(defaultSalaryForm); }}
                onSubmit={handleSubmit}
            />
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Departments"
                message={`Are you sure you want to delete ${`${selecetdSalary?.title}` || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedSalary(null);
                }}
            />
        </>
    );
}
