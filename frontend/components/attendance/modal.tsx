"use client";

import { useEffect, useState } from "react";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  form: {
    id: string;    
    checkIn: string;
    checkOut: string;
    status: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSubmit: () => void;
}

export default function Modal({ open, mode, form, setForm, onClose, onSubmit }: Props) {
  if (!open) return null;

  const [presentStatus, setPresentStatus] = useState(form.status);



  const handleChange = (field:string, value: string) =>{
    setForm((prev:any) => ({
      ...prev, 
      field: value,      
    }))
  }


  const handleStatusChange = (
    e: React.ChangeEvent<HTMLInputElement>
  )=>{
    const status = e.target.value;

    setForm((prev:any) => ({
      ...prev, 
      status:status,
      checkIn: "",
      checkOut: "",
    }));

    setPresentStatus(status);
  }

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
        width: "100%", maxWidth: 540,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        border: "1.5px solid #d1fae5",
      }}>

        {/* Header */}      
        <ModalHeader
          title={mode === "edit" ? "Edit Attendance" : "Add Branch"}
          onClose={onClose}
          subtitle={mode === "edit" ? "Update branch details" : "Add a new branch for this company"}
        />
        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
             
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>      
            <CustomSelect
              label="Status"
              value={form.status}
              // onChange={(e) => setForm((p:any) => ({...p, status: e.target.value}))}
              onChange={() => handleStatusChange}
              searchable
              options={[
                { label: "Select Status", value: "" },
                {label: "Present", value:'present'},                
                {label: "Absent", value:'absent'},                
                {label: "On Leave", value:'onLeave'},                
              ]}
            />
          </div>


          {presentStatus == 'present' && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <CustomInput
                label="Check in time"
                type="time"
                value={form.checkIn}                           
                onChange={(e) => handleChange('checkIn', e.target.value)}                           
              />

              <CustomInput
                label="Check out time"
                type="time"
                value={form.checkOut}   
                onChange={(e) => handleChange('checkOut', e.target.value)}        
              />           
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter
          title={mode === "edit" ? "Save Changes" : "Create"}  
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}