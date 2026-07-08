"use client";

import { useEffect, useState } from "react";
import CustomInput from "../common/CustomInput";
import CustomDatePicker from "../common/CustomDatePicker";
import CustomTimePicker from "../common/CustomTimePicker";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";
import { getDepartments, getDesignations } from "@/services/branch.service";
import { getCitiesByState, getStates } from "@/services/super-admin.service";
import ImageUpload from "../common/ImageUpload";

import {Employee} from './employee-table';



interface Props {
  open: boolean;
  mode: "create" | "edit";  
  form: Employee;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EmployeeModal({ open, mode, form, setForm, onClose, onSubmit }: Props) {

  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [citiesLoading, setCitiesLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>(form.state)
  

  const handleStateChange = async (value:string) => {
    const stateId = value;
    setSelectedState(stateId);
    setForm((prev: any) => ({
      ...prev,
      state: stateId,
      city: "",
    }));

    await fetchCities(stateId);
  };

  const fecthdesignations = async () =>{
    const res = await getDesignations();
    setDesignations(res.data.data);
  }

  const fetchCities = async (stateId:string) =>{
    setCitiesLoading(true);
    const res = await getCitiesByState(stateId);

    setCities(res.data.data);

    setCitiesLoading(false);
  }

  const fecthdepartments = async () =>{
    const res = await getDepartments();
    setDepartments(res.data.data);
  }

  const fecthStates = async()=>{
    const res = await getStates();
    setStates(res.data.data);
  }

  const handleChange = (field : string, value: string | File | null | boolean)=>{
    setForm((prev:any) => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(()=>{
    if(selectedState){
      fetchCities(selectedState)
    }
  }, [selectedState])


  useEffect(()=>{
    fecthdesignations();
    fecthdepartments();
    fecthStates();
  }, [])

  if (!open) return null;


  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 999, padding: "20px 16px",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 900,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        border: "1.5px solid #d1fae5",
      }}>




          {/* Header */}        
          <ModalHeader
            title={mode == 'edit' ? 'Edit Employee' : 'Add Employee'}
            subtitle={mode === 'edit' ? 'Update employee details' : 'Add a new employee'}
            onClose={onClose}
          />
          {/* Body */}
          <div style={{ padding: "24px 28px", maxHeight:"70vh", overflowY: 'auto' }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>
              <CustomInput
                label="First Name"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, firstName: e.target.value }))
                  handleChange('firstName', e.target.value)
                }
                required
              />

              <CustomInput
                label="Last Name"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, lastName: e.target.value }))
                  handleChange('lastName', e.target.value)
                }
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <CustomInput
                label="Email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, email: e.target.value }))
                  handleChange('email', e.target.value)
                }
                required
              />

              <CustomInput
                label="Phone"
                placeholder="e.g. +91 xxxxx xxxxx"
                value={form.phone}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, phone: e.target.value }))
                  handleChange('phone', e.target.value)
                }
                required
              />
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 20}}>
              {/* image input */}

              <ImageUpload
                value={form.image}                
                onChange={(file) => 
                  // setForm((p: any) => ({ ...p, image: file }))            
                  handleChange('image',file)  
                }
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>
              <CustomSelect
                label="Gender"
                value={form.gender}
                onChange={(e) =>
                  handleChange('gender', e.target.value)
                }
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
              />

              <CustomDatePicker
                label="Date of Birth"
                placeholder="01-01-2001"
                value={form.dateOfBirth}
                onChange={(e) =>
                  handleChange('dateOfBirth', e.target.value)
                }
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>

              <CustomSelect
                label="Designation"
                value={typeof form.designation === "object" && form.designation ? form.designation._id : form.designation}
                onChange={(e) =>
                  handleChange('designation', e.target.value)
                  // setForm((p: any) => ({ ...p, designation: e.target.value }))
                }
                options={[
                  {label: '-Select-', value: ''},
                  ...designations.map((designation)=>(
                    {label: designation.title, value: designation._id}
                  ))
                ]}          
              />

              <CustomSelect
                label="Department"
                value={typeof form.department === "object" && form.department ? form.department._id : form.department}
                onChange={(e) =>
                  handleChange('department', e.target.value)
                  // setForm((p: any) => ({ ...p, department: e.target.value }))
                }            
                options={[
                  {label: '-Select-', value: ''},
                  ...departments.map((department)=>(
                    {label: department.title, value: department._id}
                  ))
                ]}          
              />
            </div>


            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>
              <CustomDatePicker
                label="Joining Date"
                value={form.joiningDate}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, joiningDate: e.target.value }))
                    handleChange('joiningDate', e.target.value)
                }
              />

              <CustomSelect
                label="Employment Type"
                value={form.employmentType}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, employmentType: e.target.value }))
                  handleChange('employmentType', e.target.value)
                }
                options={[
                  { label: "Full Time", value: "full_time" },
                  { label: "Part Time", value: "part_time" },
                  { label: "Intern", value: "intern" },
                  { label: "Contract", value: "contract" },
                ]}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>
              <CustomInput
                label="Basic Salary"
                type="number"
                value={form.basicSalary}
                placeholder="e.g. 15000"
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, basicSalary: Number(e.target.value) }))
                  handleChange('basicSalary', e.target.value)
                }
                required
              />

              <CustomSelect
                label="Salary Type"
                value={form.salaryType}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, salaryType: e.target.value }))
                  handleChange('salaryType', e.target.value)
                }
                options={[
                  { label: "Monthly", value: "monthly" },
                  { label: "Daily", value: "daily" },
                  { label: "Hourly", value: "hourly" },
                ]}
              />
            </div>


            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 , marginBottom: 20}}>

              <CustomInput
                label="Address"
                value={form.address}
                placeholder="e.g. New Delhi"
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, address: e.target.value }))
                  handleChange('address', e.target.value)
                }
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>
              
              {/* <CustomInput
                label="State"
                value={form.state}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, state: e.target.value }))
                }
              /> */}

              <CustomSelect
                label="State"
                value={form.state}              
                onChange={(e) => handleStateChange(e.target.value)}
                searchable
                options={[
                  {label: '-Select-', value: ''},
                  ...states.map((state)=>(
                    {label:state.name, value:state.stateId}
                  ))
                ]}
                required
              />


              <CustomSelect
                label="City"
                value={form.city}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, city: e.target.value }))
                  handleChange('city', e.target.value)
                }
                searchable
                loading={citiesLoading}
                options={[
                  {label: '-Select-', value: ''},
                  ...cities.map((city)=>(
                    {label: city.name, value:city.cityId}
                  ))
                ]}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>
              <CustomInput
                label="Country"
                value={form.country}
                readonly
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, country: e.target.value }))
                  handleChange('country', e.target.value)
                }
              />

              <CustomInput
                label="Pincode"
                placeholder="111111"
                value={form.pincode}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, pincode: e.target.value }))
                  handleChange('pincode', e.target.value)
                }
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr 3fr", gap: 16 , marginBottom: 20}}>
              <CustomInput
                label="Shift Name"
                value={form.shiftName}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, shiftName: e.target.value }))
                  handleChange('shiftName', e.target.value)
                }
              />

              <CustomTimePicker
                label="Start Time"
                value={form.shiftStartTime}
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, shiftStartTime: e.target.value }))
                  handleChange('shiftStartTime', e.target.value)
                }
              />

              <CustomTimePicker
                label="End Time"
                value={form.shiftEndTime}                
                onChange={(e) =>
                  // setForm((p: any) => ({ ...p, shiftEndTime: e.target.value }))
                  handleChange('shiftEndTime', e.target.value)
                }
              />
            </div>


              {mode !== 'edit' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 , marginBottom: 20}}>

                  <CustomInput
                    label="Password"
                    type="password"
                    placeholder="********"
                    maxLength={8}
                    value={form.password}
                    onChange={(e) =>
                      // setForm((p: any) => ({ ...p, password: e.target.value }))
                      handleChange('password', e.target.value)
                    }
                    required
                  />         

                    <CustomSelect
                      label="Login Access"
                      value={form.isLoginEnabled ? "true" : "false"}
                      onChange={(e)=>
                        // setForm((p:any)=>({
                        //   ...p,
                        //   isLoginEnabled:e.target.value==="true"
                        // }))
                        handleChange('isLoginEnabled', e.target.value == 'true')
                      }
                      options={[
                        { label:"Enabled", value:"true" },
                        { label:"Disabled", value:"false" }
                      ]}
                    />
                </div>            
              )}
            
          </div>

          {/* Footer */}
          <ModalFooter
            onClose={onClose}
            title={mode == 'edit' ? 'Save Cahnges' : 'Add'}
            onSubmit={onSubmit}
          />
        {/* <form onSubmit={onSubmit}>
        </form> */}
      </div>
    </div>
  );
}