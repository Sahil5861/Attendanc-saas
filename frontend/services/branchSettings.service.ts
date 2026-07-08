import api from "./api";

export const getBranchSettings = () =>{
    return api.get('/settings/branch');
}


export const updateBranchSettings = (payload:any)=>{
    return api.put('/settings/branch', payload);
}
