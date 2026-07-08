"use client";

import { useState, useEffect } from "react";

import EmptyState from "@/components/company/empty-state";
import CompanyTable from "@/components/company/company-table";
import CompanyForm from "@/components/company/company-form";
import { deleteCompany, getCompanies, getStates } from "@/services/super-admin.service";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CompanyModal from "@/components/company/company-modal";

import { useRouter } from "next/navigation";

import { usePermission } from "@/hooks/usePermission";


export default function CompaniesPage() {

    const { can, initialized } = usePermission();

    useEffect(() => {
        if (!initialized) return;
        if (!can("company.view")) {
            router.replace("/unauthorized");
        }
    }, []);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] =
        useState<any>(null);

    const router = useRouter();


    const [companies, setCompanies] = useState([]);
    const [states, setStates] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompanies = async () => {
            await fetchCompanies();
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        const loadStates = async () => {
            await fetchStates();
        };

        loadStates();
    }, []);


    const fetchCompanies = async () => {

        try {
            setLoading(true);
            const response = await getCompanies();

            const data = response.data;

            console.log(data);


            setCompanies(data.data || [])

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong !!');
        }
        finally {
            setLoading(false);
        }
    }

    const fetchStates = async () => {

        try {
            setLoading(true);
            const response = await getStates();

            const data = response.data;

            console.log(data);


            setStates(data.data || [])

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong !!');
        }
        finally {
            setLoading(false);
        }
    }

    const handleCreate = () => {

        setSelectedCompany(null);

        setOpen(true);
    };

    const handleView = (company: any)=>{
        router.push(`/super-admin/companies/${company._id}`);
    }

    const handleEdit = (company: any) => {

        setSelectedCompany(company);

        setOpen(true);
    };

    const confirmDelete = async () => {

        if (!selectedCompany) return;

        try {

            const response = await deleteCompany(
                selectedCompany._id
            );

            toast.success(response.data.message);

            setCompanies(prev =>
                prev.filter(
                    (item : any)=>
                        item._id !== selectedCompany._id
                )
            );

        } catch (error: any) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete company"
            );

        } finally {

            setConfirmOpen(false);
            setSelectedCompany(null);

        }
    };

    const handleDelete = async (company: any) => {

        setSelectedCompany(company)
        setConfirmOpen(true);        
    };

    return (
        <>
            {
                companies.length === 0 ? (
                    <EmptyState
                        onCreate={handleCreate}

                    />
                ) : (
                    <CompanyTable
                        companies={companies}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                    />
                )
            }

            <CompanyModal
                open={open}            
                title={
                    selectedCompany ? "Edit Company" : "Add Company"
                }
                subtitle={selectedCompany ? 'Edit the company selected' : 'Register new Company'}
                onClose={() => {
                    setOpen(false)
                    setSelectedCompany(null)
                }}
            >
                <CompanyForm
                    mode={
                        selectedCompany ? "edit" : "create"
                    }
                    states={states}

                    company={selectedCompany}
                    onSuccess={() => {
                        fetchCompanies();
                    }}
                    onClose={() => {
                        setOpen(false)
                        setSelectedCompany(null)
                    }
                    }
                />
            </CompanyModal>
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Company"
                message={`Are you sure you want to delete ${selectedCompany?.companyName || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedCompany(null);
                }}
            />
        </>
    );
}
