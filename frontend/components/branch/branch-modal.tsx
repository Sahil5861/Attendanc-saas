"use client";

import { useEffect, useState } from "react";
import CustomInput from "../common/CustomInput";
import CustomSelect from "../common/CustomSelect";
import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import { getCitiesByState, getStates } from "@/services/super-admin.service";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import ModalFooter from "../common/ModalFooter";
import ModalHeader from "../common/ModalHeader";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  form: {
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

export default function BranchModal({ open, mode, form, setForm, onClose, onSubmit }: Props) {
  if (!open) return null;

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      await fetchStates();
    };

    loadStates();
  }, []);

  const updateCities = async (stateId: string) => {
    try {
      setCitiesLoading(true);
      const response = await getCitiesByState(stateId);

      setCities(response.data.data || []);
      setCitiesLoading(false);


    } catch (error) {
      console.error(error);
    }
  };


  const handleStateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const stateId = e.target.value;

    setForm((prev:any) => ({
      ...prev,
      state: stateId,
      city: "", // reset city when state changes
    }));

    updateCities(stateId);
  };

  const handleCityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cityId = e.target.value;

    setForm((prev:any) => ({
      ...prev,
      city: cityId,
    }));
  };



  const fetchStates = async () => {

    try {
      setLoading(true);
      const response = await getStates();

      const data = response.data;
      setStates(data.data || [])

    } catch (error) {
      console.log(error);
      toast.error('Something went wrong !!');
    }
    finally {
      setLoading(false);
    }
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
          title={mode === "edit" ? "Edit Branch" : "Add Branch"}
          onClose={onClose}
          subtitle={mode === "edit" ? "Update branch details" : "Add a new branch for this company"}
        />
        {/* Body */}
        <div style={{ padding: "24px 28px" }}>

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


          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
            <CustomInput
              label="Location"
              type="text"
              value={form.location}
              onChange={(e) => setForm((p: any) => ({ ...p, location: e.target.value }))}
              placeholder="e.g. Main Market Road"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>      
            <CustomSelect
              label="State"
              value={form.state}
              onChange={() => handleStateChange}
              searchable
              options={[
                { label: "Select State", value: "" },
                ...(states ?? []).map((state: any) => ({
                  label: state.name,
                  value: state.stateId,
                })),
              ]}
            />

            <CustomSelect
              label="City"
              loading={citiesLoading}
              value={form.city}
              onChange={()=> handleCityChange}
              searchable
              options={[
                { label: "Select City", value: "" },
                ...(cities ?? []).map((city: any) => ({
                  label: city.name,
                  value: city.cityId,
                }))
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <CustomInput
              label="Mobile Number"
              type="tel"
              value={form.mobileNumber}
              onChange={(e) => setForm((p: any) => ({ ...p, mobileNumber: e.target.value }))}
              placeholder="e.g. 9876543210"
            />

            {mode != "edit" && (
              <CustomInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. email@gmail.com"
              />
            )}

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
          title={mode === "edit" ? "Save Changes" : "Create"}  
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}