import api from "./api";


export const getEmployeeSalary = ()=> api.get('/employee/employee-salary');
export const createEmployeeSalary = (data:object)=> api.post('/employee/employee-salary', data);
export const updateEmployeeSalary = (id:string, data:object)=> api.put(`/employee/employee-salary/${id}`, data);
export const viewEmployeeSalary = (id:string)=> api.get(`/employee/employee-salary/${id}`);