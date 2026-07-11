"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import Modal from "@/components/documents/modal";
import Table from "@/components/documents/table";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { EmployeeDocument, defaultForm } from "@/components/documents/modal";
import toast from "react-hot-toast";
import { createDocuments, deleteDocuments, getDocuments } from "@/services/employee.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DocumentViewModal from "@/components/documents/DocumentViewModal";

export default function Page() {
    const [loading, setLoading] = useState(false);

    const [documents, setDocuments] = useState<EmployeeDocument[]>([]);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [selectedDocument, setSelectedDocument] =
        useState<EmployeeDocument | null>(null);

    const [form, setForm] = useState<EmployeeDocument>(defaultForm);
    const [viewDoc, setViewDoc] = useState<EmployeeDocument | null>(null);

    const user = useSelector((state: RootState) => state.auth.user);

    const employeeId = user?.employeeId;

    const fetchdocuments = useCallback(async () => {
        if (!employeeId) return;

        try {
            const res = await getDocuments(employeeId);
            if (res.data.success === true) {
                setDocuments(res.data.data);
            }

        } catch {
            toast.error('Failed to fetch Documents');
        }
    }, [employeeId])

    useEffect(() => {
        void Promise.resolve().then(fetchdocuments);
    }, [fetchdocuments])

    const handleCreate = () => {
        setSelectedDocument(null);
        setForm(defaultForm);
        setOpen(true);
    };

    const validateForm = (form: EmployeeDocument) => {
        const errors: Record<string, string> = {};

        if (!form.documentName.trim()) {
            errors.documentName = "Document name is required.";
        }

        if (!form.documentType.trim()) {
            errors.documentType = "Document type is required.";
        }

        if (!form.documentNumber.trim()) {
            errors.documentNumber = "Document number is required.";
        }

        if (!form.issueDate) {
            errors.issueDate = "Issue date is required.";
        }

        if (!form.expiryDate) {
            errors.expiryDate = "Expiry date is required.";
        }

        if (form.issueDate && form.expiryDate) {
            const issue = new Date(form.issueDate);
            const expiry = new Date(form.expiryDate);

            if (expiry < issue) {
                errors.expiryDate =
                    "Expiry date cannot be earlier than issue date.";
            }
        }

        if (!form.file) {
            errors.file = "Please upload a document.";
        } else {
            const allowedTypes = [
                // Images
                "image/jpeg",
                "image/png",
                "image/webp",

                // PDF
                "application/pdf",

                // Word
                "application/msword", // .doc
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

                // Excel
                "application/vnd.ms-excel", // .xls
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx

                // CSV
                "text/csv",
                "application/csv",
                "text/x-csv",
                "application/vnd.ms-excel", // Some browsers upload CSV with this MIME type
            ];

            if (form.file instanceof File && !allowedTypes.includes(form.file.type)) {
                errors.file =
                    "Only JPG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX, and CSV files are allowed.";
            }

            const maxSize = 5 * 1024 * 1024;

            if (form.file instanceof File && form.file.size > maxSize) {
                errors.file = "Maximum file size is 5 MB.";
            }
        }

        return errors;
    };


    const handleSubmit = async () => {

        try {

            const errors = validateForm(form);

            if (Object.keys(errors).length > 0) {
                console.log(errors);

                // agar toast use kr rhe ho
                Object.values(errors).forEach((message) => {
                    toast.error(message);
                    // alert(message);
                });

                return;
            }



            const formData = new FormData();

            formData.append("documentName", form.documentName);
            formData.append("documentType", form.documentType);
            formData.append("documentNumber", form.documentNumber);
            formData.append("issueDate", form.issueDate);
            formData.append("expiryDate", form.expiryDate);
            formData.append("employeeId", employeeId);

            if (form.file instanceof File) {
                formData.append("file", form.file);
            }

            setLoading(true);
            const res = await createDocuments(formData);
            toast.success(res.data.message || 'Documnet uploaded successfully !');
            setOpen(false);
            setForm(defaultForm);
            await fetchdocuments();

        } catch {
            setLoading(false);
            toast.error('Failed to upload Your Document');
        }
        finally {
            setLoading(false);
        }


    }

    const handleDelete = (document: EmployeeDocument) => {
        setSelectedDocument(document)
        setConfirmOpen(true);
    }




    const confirmDelete = async () => {
        if (!selectedDocument) return;

        try {
            const id = selectedDocument._id;
            await deleteDocuments(id);
            toast.success("Document Deleted successfully !");

            setDocuments((prev) => prev.filter((l) => l._id !== selectedDocument._id));

        } catch (error: unknown) {
            console.error(error);
            toast.error('Failed to delete');
        }
        finally {
            setConfirmOpen(false);
            setSelectedDocument(null);
        }
    }

    const openViewModal = (doc: EmployeeDocument) => {
        setViewDoc(doc);
    }

    return (
        <>
            {documents.length === 0 ? (
                <EmptyState
                    title="No Documents Added Yet"
                    subTitle="Upload employee documents like Resume etc."
                    buttonText="Upload Document"
                    onCreate={handleCreate}
                />
            ) : (
                <div>
                    {/* Documents Table / Cards */}
                    <Table
                        document={documents}
                        onCreate={handleCreate}
                        onView={(doc) => openViewModal(doc)}   // 👈 naya, optional — details/preview dikhane ke liye
                        onDelete={(doc) => handleDelete(doc)}

                    />
                </div>
            )}


            <Modal
                open={open}
                mode={mode}
                form={form}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedDocument(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />

            <DocumentViewModal
                document={viewDoc}
                onClose={() => setViewDoc(null)}
            />
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Departments"
                message={`Are you sure you want to delete ${`${selectedDocument?.documentName}` || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedDocument(null);
                }}
            />
        </>
    );
}
