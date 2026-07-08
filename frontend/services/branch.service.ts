import api from "./api";


// company branch
export const getEmployeeById = (id: string) => api.get(`/branch/employees/${id}`);

export const getEmployees    = () => api.get(`/branch/employees`);
export const createemployee   = (data: FormData)         => api.post("/branch/employees", data);
export const updateemployee   = (id: string, data: FormData) => api.put(`/branch/employees/${id}`, data);
// export const updateEmployeeStatus = (id: string, feild: FormData) => api.put(`branch/employees/update/${id}`, feild);
export const updateEmployeeStatus = (id: string, payload: any) => api.patch(`branch/employee/${id}/status`, payload)
export const deleteEmployee   = (id: string)        => api.delete(`/branch/employees/${id}`);


//── Get all available plans (for the cards grid) ───────────────────────
export const getPlans = () => api.get("/branch/plans");
 
// ── Get the branch's current active plan relation ──────────────────────
// Expected response: { data: { _id, branch_id, plan_id, status, createdAt } | null }
export const getBranchActivePlan = (branchId: string) => api.get(`/branch/${branchId}/active-plan`);
 
// ── Assign a plan to a branch ───────────────────────────────────────────
// Backend logic required:
//   1. Find existing branch_plan_relation for this branch_id where status = "active"
//      → set status = "expired"
//   2. Create a new branch_plan_relation: { branch_id, plan_id, status: "active" }
export const assignPlanToBranch = (payload: { branch_id: string; plan_id: string }) => api.post("/branch/assign-plan", payload);



// Designation
export const getDesignations = () => api.get('/branch/designations');
export const createDesignations = (data:any) => api.post('/branch/designations', data);
export const updateDesignations = (id:string, data:any) => api.put(`/branch/designations/${id}`, data);
export const deleteDesignations = (id:string) => api.delete(`/branch/designations/${id}`);


// Designation
export const getDepartments = () => api.get('/branch/departments');
export const createDepartments = (data:any) => api.post('/branch/departments', data);
export const updateDepartments = (id:string, data:any) => api.put(`/branch/departments/${id}`, data);
export const deleteDepartments = (id:string) => api.delete(`/branch/departments/${id}`);


// Team
export const getTeam = () => api.get('/branch/teams');
export const createTeam = (data:any) => api.post('/branch/teams', data);
export const updateTeam = (id:string, data:any) => api.put(`/branch/teams/${id}`, data);
export const deleteTeam = (id:string) => api.delete(`/branch/teams/${id}`);


// Leaves
export const getLeaves = () => api.get('/branch/leaves');
export const updateLeaveStatus  = (id:string, status: string) => api.put(`/branch/leaves/${id}/${status}`);


// salary
export const deleteSalary = (id:string) => api.delete(`/branch/salary/${id}`);

// attendance
export const getEmployeeAttendance = (employeeId: string,month: number,year: number) => {
  return api.get(`/branch/${employeeId}/attendance`, {
    params: { month, year },
  });
};
 
export const updateAttendance = (data:any) => api.post('/branch/update-attendance', data);