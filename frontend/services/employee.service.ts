import api from "./api";


// company branch
export const getEmployeeById = (id: string) => api.get(`/branch/employees/${id}`);


export const checkInEmployee = (id:string, data:any) => api.post(`/employee/checkin/${id}`, data);
export const checkOutEmployee = (id:string, data:any) => api.post(`/employee/checkOut/${id}`, data);

// leaves
export const getLeave = (id:string) => api.get(`employee/leaves/${id}`);
export const createLeave = (data:any) => api.post(`employee/leaves`, data);
export const deleteLeave = (id:string) => api.delete(`employee/leaves/${id}`);