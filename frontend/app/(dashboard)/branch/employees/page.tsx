"use client";

import { useEffect, useState } from "react";

import EmptyState from "@/components/common/EmptyState";
import Table, {Employee} from "@/components/employee/employee-table";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useRouter } from "next/navigation";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { usePermission } from "@/hooks/usePermission";
import EmployeeModal from "@/components/employee/employee-modal";
import {
  updateemployee,
  createemployee,
  getEmployees,
  deleteEmployee,
} from "@/services/branch.service";
import SalaryModal from "@/components/employee/employee-salary";
import { log } from "node:console";
import { getImageUrl } from "@/constants/helper";
import { Users } from "lucide-react";


const defaultForm: any = {
  _id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  image: null,

  designation: "",
  department: "",
  joiningDate: "",
  employmentType: "",

  basicSalary: "",
  salaryType: "monthly",

  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",

  shiftName: "",
  shiftStartTime: "",
  shiftEndTime: "",

  password: "",
  isLoginEnabled: false,
  status: false,
};

// Keys of Employee that must be filled before the form can be submitted.
const requiredFields: (keyof Employee)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "gender",
  "designation",
  "department",
  "joiningDate",
  "employmentType",
  "basicSalary",
  "salaryType",
  "state",
  "city",
  "password",
];

export default function EmployeePage() {
  const { can, initialized } = usePermission();

  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!can("employee.view")) {
      router.replace("/unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const user = useSelector((state: RootState) => state.auth.user);
  const plan = useSelector((state: RootState) => state.auth.plan);

  const branchId = user?.branchId;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<any>(defaultForm);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();

      if (response.data?.success === true) {
        const data = response.data;
        setEmployees(data?.data || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong !!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ──

  const validateForm = () => {
    for (const field of requiredFields) {
      const value = form[field];

      if (value === "" || value === null || value === undefined) {
        toast.error(`${field} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    // if (!validateForm()) return;

    console.log("Submitting form:", form);

    const formData = new FormData();


    Object.entries(form).forEach(([key, value]) => {
      // if(key == 'designation' || key == 'department') {
      //   formData.append(key, JSON.stringify(value));
      // }
      if(key == 'image'){
        if(value) {
          formData.append("image", value as File);
        }
      }
      else{
        formData.append(key, String(value ?? ''));
      }
    })


    console.log('entries : ', [...formData.entries()]);

    // return false;
    try {
      if (mode === "edit" && selectedEmployee) {
        await updateemployee(selectedEmployee._id, formData);
        toast.success("Employee updated successfully");
      } else {
        await createemployee(formData);
        toast.success("Employee added successfully");
      }      
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    }
    finally {
      setOpen(false);
      setSelectedEmployee(null);
      setForm(defaultForm);
      fetchEmployees();
    }
  };

  const handleCreate = () => {
    setMode("create");
    setSelectedEmployee(null);
    setForm(defaultForm);
    setOpen(true);
  };

  const handleView = (employee: Employee) => {
    router.push(`/branch/employees/${employee._id}`);
  };

  const handleViewSalary = (employee: Employee) => {
    setSalaryOpen(true);
    setSelectedEmployee(employee);
  };

  const handleEdit = (employee: Employee) => {
    setMode("edit");

    setSelectedEmployee(employee);


    setForm({
      _id: employee._id,
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      gender: employee.gender || "",
      dateOfBirth: employee.dateOfBirth
        ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
        : "",

      image: employee.image ? getImageUrl(employee.image, 'employees') :  null,

      designation: employee.designation._id || '',
      department:  employee.department._id || '',
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split("T")[0]
        : "",
      employmentType: employee.employmentType || "",

      basicSalary: employee.basicSalary || "",
      salaryType: employee.salaryType || "monthly",

      address: employee.address || "",
      city: employee.city || "",
      state: employee.state || "",
      country: employee.country || "",
      pincode: employee.pincode || "",

      shiftName: employee.shiftName || "",
      shiftStartTime: employee.shiftStartTime || "",
      shiftEndTime: employee.shiftEndTime || "",

      password: employee.password || "",
      isLoginEnabled: employee.isLoginEnabled || false,
      status: employee.status || false,
    });
    
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await deleteEmployee(selectedEmployee._id);

      toast.success(response.data.message);

      setEmployees((prev) =>
        prev.filter((item) => item._id !== selectedEmployee._id)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete employee");
    } finally {
      setConfirmOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleDelete = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setConfirmOpen(true);
  };

  return (
    <>
      {!loading && employees.length === 0 ? (
        <EmptyState
          title="No Employees Found"
          subTitle="Create Your first Employee"
          buttonText="Add"
          onCreate={handleCreate}
          icon={<Users className="h-full w-full"/>}
        />
      ) : (
        <Table
          employees={employees}
          loading={loading}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          // opens a popup showing the calculated salary of the employee
          onViewSalary={handleViewSalary}
        />
      )}

      <EmployeeModal
        open={open}
        mode={mode}
        form={form}
        setForm={setForm}
        onClose={() => {
          setOpen(false);
          setSelectedEmployee(null);
          setForm(defaultForm);
        }}
        onSubmit={handleSubmit}
      />

      {salaryOpen && selectedEmployee && (
        <SalaryModal
          open={salaryOpen}
          employee={selectedEmployee}
          onClose={() => {
            setSalaryOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${
          selectedEmployee
            ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
            : ""
        }?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedEmployee(null);
        }}
      />
    </>
  );
}