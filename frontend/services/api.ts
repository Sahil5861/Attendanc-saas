import axios from "axios";
import Cookies from "js-cookie";
import { getToken, getUser } from "@/lib/auth";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.request.use(
  (config) => {

    const token = getToken();    


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;        
    }


    const branchId = Cookies.get("active_branch_id");
    if (branchId) {
      config.headers['X-Branch-Id'] = branchId;
    }
    return config;
  }
);

export default api;