import api from "./api";


// common
export const getStates = async () =>{
    return api.get('/super-admin/states');
}

export const getCitiesByState = async(stateId:string) => {
    return api.get(`/super-admin/state-cities/${stateId}`);
}




export const getStateById = async(id:string) => api.get(`/super-admin/states/${id}`);
export const getCityById = async(id:string) => api.get(`/super-admin/cities/${id}`);

export const loadSuperAdminDashboardData = async ()=>{
    return api.get('/super-admin/data');
}

export const loadCompanyDashboardData  = async (id: string)=>{
    return api.get(`/company/data/${id}`);
}

export const loadBranchDashboardData = async (id: string)=>{
    return api.get(`/branch/data/${id}`);
}

export const loadEmployeeDashboardData = async (id: string) =>{
    return api.get(`/employee/data/${id}`);
}



export const getCompanies = async ()=>{
    return api.get('/super-admin/companies');
}

export const getBranchesByCompany = async(id: string)=>{
    return api.get(`/super-admin/getBranchesByCompany/${id}`)
}

export const createCompany = async (data: any)=>{
    return api.post('/super-admin/companies', data);
}

export const updateCompany = async (id: string,data: any) => {
    return api.put(`/super-admin/companies/${id}`,data);
};

export const deleteCompany = async (id: string) => {
    return api.delete(`/super-admin/companies/${id}`);
};



// company branch
export const getCompanyById = (id: string) => api.get(`/super-admin/companies/${id}`);

export const getBranches    = () => api.get(`/super-admin/branches`);
export const createBranch   = (data: any)         => api.post("/super-admin/branches", data);
export const updateBranch   = (id: string, data: any) => api.put(`/super-admin/branches/${id}`, data);
export const deleteBranch   = (id: string)        => api.delete(`/super-admin/branches/${id}`);


// users

export const getUsers = async ()=>{
    return api.get('/super-admin/users');
}

export const updateUserStatus = async (id: string)=>{
    return api.post(`/super-admin/update-user-status/${id}`);
}

// Roles

export const getRoles = async ()=>{
    return api.get('/super-admin/roles');
}

// Get all available permissions in system
export const getAllPermissions = () => api.get("/super-admin/permissions");
export const deletePermission = (id: String) => api.delete(`/super-admin/permissions/${id}`);
export const createPermission = (data: any) => api.post(`super-admin/permissions`, data);

// Update role permissions
export const updateRolePermissions = (roleId: string, permissionIds: string[]) =>
  api.put(`/super-admin/roles/${roleId}/permissions`, { permissions: permissionIds });
  // adjust endpoint to match your backend


// FEatures

export const getFeatures = ()=> api.get("/super-admin/features");
export const createFeature = (data:any)=> api.post("/super-admin/features", data);
export const updateFeature = (id: string, data: any) => api.put(`/super-admin/features/${id}`, data);
export const deleteFeature = (id: string) => api.delete(`/super-admin/features/${id}`);

//   Plans
export const getAllPlans = () => api.get("/super-admin/plans");
export const createPlan   = (data: any)              => api.post("/super-admin/plans", data);
export const updatePlan   = (id: string, data: any)  => api.put(`/super-admin/plans/${id}`, data);
export const deletePlan   = (id: string)             => api.delete(`/super-admin/plans/${id}`);
// getFeatures already exists from feature section
