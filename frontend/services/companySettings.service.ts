import api from "./api";

export const getCompanySettings = () =>{
    return api.get('/settings/company');
}


export const updateCompanySettings = (payload:any)=>{
    return api.put('/settings/company', payload);
}
