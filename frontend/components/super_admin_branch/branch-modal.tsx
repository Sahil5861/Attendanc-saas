"use client";

import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  companies : any[];
  form: {
    company_id:string;
    branchOwnerName: string;
    branchName: string;
    location: string;
    city: string;
    state: string;
    mobileNumber: string;
    email: string;
    password: string;
    status: boolean;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BranchModal({ open, mode, form, setForm, onClose, onSubmit,companies }: Props) {
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
        width: "100%", maxWidth: 540,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        border: "1.5px solid #d1fae5",
      }}>

        {/* Header */}      

        <ModalHeader
          title={mode == 'edit' ? 'Edit Branch' : 'Add Branch'}
          subtitle={mode === "edit" ? "Update branch details" : "Add a new branch for this company"}
          onClose={onClose}          
        />

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>

            <CustomSelect
              label="Select Company"
              value={form.company_id}
               onChange={(e) => setForm((p: any) => ({ ...p, company_id: e.target.value }))}
               options={[
                {label: "Select Company", value:""},

                ...companies.map((company)=>(
                  {label: company.companyName, value: company._id}
                ))
               ]}
            />
            </div>

          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            

            <CustomInput
              label="Branch Name"
              type="text"
              value={form.branchName}
              onChange={(e) => setForm((p: any) => ({ ...p, branchName: e.target.value }))}
              placeholder="e.g. Connaught Place Branch"
            />
            <CustomInput
              label="Branch Owner Name"
              type="text"
              value={form.branchOwnerName}
              onChange={(e) => setForm((p: any) => ({ ...p, branchOwnerName: e.target.value }))}
              placeholder="e.g. Rahul Sharma"
            />
          </div>


          <CustomInput
            label="Location"
            type="text"
            value={form.location}
            onChange={(e) => setForm((p: any) => ({ ...p, location: e.target.value }))}
            placeholder="e.g. Main Market Road"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <CustomInput
              type="text"
              label="City"
              onChange={(e) => setForm((p: any) => ({ ...p, city: e.target.value }))}
              value={form.city}
            />

            <div>
              <CustomInput
                type="text"
                label="State"
                onChange={(e) => setForm((p: any) => ({ ...p, state: e.target.value }))}
                value={form.state}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <CustomInput
              label="Mobile Number"
              type="tel"
              value={form.mobileNumber}
              onChange={(e) => setForm((p: any) => ({ ...p, mobileNumber: e.target.value }))}
              placeholder="e.g. 9876543210"
            />

            <CustomInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))}
              placeholder="e.g. email@gmail.com"
            />

            {mode != "edit" && (
              <CustomInput
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p: any) => ({ ...p, password: e.target.value }))}
                placeholder="e.g. 9876543210"
              />
            )}

            <CustomSelect
              label="Status"
              value={form.status ? "true" : "false"}
              onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value === "true" }))}
              options={[
                {
                  label: "Active",
                  value: "true",
                },
                {
                  label: "Inactive",
                  value: "false",
                },
              ]}
            />
          </div>
        </div>

        {/* Footer */}
        <ModalFooter
          onClose={onClose}
          onSubmit={onSubmit}
          title={mode === "edit" ? "Save Changes" : "Add Branch"}
        />
      </div>
    </div>
  );
}