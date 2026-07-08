"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import Modal, {Employee} from "@/components/teams/modal";
import Table, {Team} from "@/components/teams/table";
import { createTeam, getTeam, getEmployees, updateTeam, deleteTeam } from "@/services/branch.service";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast"



const defaultForm: any = {
    title: "",
    slug: "",
    teamLead: "",
    employeeIds: [],
    status: true,
}

export default function TeamPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [form, setForm] = useState(defaultForm);
    const [employees, setEmployees] = useState<Employee[]>([]); // State to hold employees data

    // Fetch teams data
    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await getTeam();            
            setTeams(response?.data?.data);
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees();
            setEmployees(response.data?.data || []); // Assuming the API returns employees in this structure
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }

    useEffect(() => {
        fetchTeams();
        fetchEmployees();
    }, []);

    const handleCreate = () => {
        // Logic to handle creating a new team
        setOpen(true);
        setMode("create");
        setSelectedTeam(null); // Reset selected team for creation
        console.log("Create new team");
        setForm(defaultForm);
    }

    const handleEdit = (team: Team) => {
        // Logic to handle editing a team
        setOpen(true);
        setMode("edit");
        setSelectedTeam(team); // Set the selected team for editing
        console.log("Edit team:", team);
        console.log('selectedTeam : ', selectedTeam)
        setForm({
            title: team?.title || '',
            slug: team?.slug || '',
            teamLead: team?.teamLead || '',
            employeeIds: team?.employeeIds || [],
            status: team.status
        })
    }

    const handleDelete = (team: Team) => {
        // Logic to handle deleting a team
        setSelectedTeam(team);
        setConfirmOpen(true);
    }


    const handleSubmit = async () => {
        try {
            const payload = {
                title: form.title,
                slug: form.slug,
                status: form.status,
                teamLead: form.teamLead,
                employeeIds: form.employeeIds,
            };


            // const res = mode == 'create' ? await createTeam(payload) : await updateTeam(id, payload);

            if (mode == 'create') {
                await createTeam(payload);
            }
            else{
                
                if(!selectedTeam?._id) return;
                
                const id = selectedTeam._id;
                await updateTeam(id, payload);
            }   
            toast.success(`Team ${mode === 'create' ? 'created' : 'updated'} successfully`);                
            await fetchTeams();             
        }
        catch (error) {
            console.error(error)
            toast.error('Server Error');
        }
        finally {
            setOpen(false);
        }
    }


    const confirmDelete = async () => {

        if (!selectedTeam) return;

        try {

            const response = await deleteTeam(
                selectedTeam._id
            );

            toast.success(response.data.message);

            setTeams(prev =>
                prev.filter(
                    (item: any) =>
                        item._id !== selectedTeam._id
                )
            );

        } catch (error: any) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete Team"
            );

        } finally {

            setConfirmOpen(false);
            setSelectedTeam(null);

        }
    };

    return (

        <>
            {teams.length == 0 ? (
                <EmptyState
                    title="No Teams Found"
                    subTitle="Create Your first Team"
                    buttonText="Add"
                    onCreate={handleCreate}
                />
            ) : (
                <Table
                    teams={teams}
                    loading={loading}
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <Modal
                employees={employees}
                open={open}
                mode={mode}
                form={form}
                setForm={setForm}
                onClose={() => { setOpen(false); setSelectedTeam(null); setForm(defaultForm); }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Team"
                message={`Are you sure you want to delete ${`${selectedTeam?.title}` || ""
                    }?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedTeam(null);
                }}
            />
        </>
    )
} 