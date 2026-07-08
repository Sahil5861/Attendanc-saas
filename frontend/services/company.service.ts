import api from "./api";


// company branch
export const getBranchById = (id: string) => api.get(`/company/branches/${id}`);

export const getBranches    = () => api.get(`/company/branches`);
export const createBranch   = (data: any)         => api.post("/company/branches", data);
export const updateBranch   = (id: string, data: any) => api.put(`/company/branches/${id}`, data);
export const deleteBranch   = (id: string)        => api.delete(`/company/branches/${id}`);
