import api from "./api";


// company branch
export const getEmployeeById = (id: string) => api.get(`/branch/employees/${id}`);


export const checkInEmployee = (id:string, data: Record<string, unknown>) => api.post(`/employee/checkin/${id}`, data);
export const checkOutEmployee = (id:string, data: Record<string, unknown>) => api.post(`/employee/checkOut/${id}`, data);

// profile
export const getEmployeeProfile = () => api.get(`employee/profile`);
export const updateEmployeeProfile = (data: FormData) => api.put(`employee/profile`, data);
export const changeEmployeePassword = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => api.put(`employee/profile/password`, data);

// leaves
export const getLeave = (id:string) => api.get(`employee/leaves/${id}`);
export const createLeave = (data: Record<string, unknown>) => api.post(`employee/leaves`, data);
export const deleteLeave = (id:string) => api.delete(`employee/leaves/${id}`);


// documnets
export const getDocuments = (id:string) => api.get(`employee/docs/${id}`);
export const createDocuments = (data:FormData) => api.post(`employee/docs`, data);
export const deleteDocuments = (id:string) => api.delete(`employee/docs/${id}`);
