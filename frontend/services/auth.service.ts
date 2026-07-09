import api from "./api";

export const loginUser = async (
  email: string,
  password: string
) => {

  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};

export const initiateSignup = async(data: any) => api.post('/auth/initiate', data); 

export const getMe = async () => {
    return api.get("/auth/me");
};


export const verifyOtp = async(data: any) => api.post('/auth/verifyOtp', data);
export const resendOtp = async(data: any) => api.post('/auth/resendOtp', data);

export const getNewCaptcha = async(length:number) => api.get(`/auth/getNewCaptcha/${length}`);


// forgot password
export const sendForgotPasswordOtp = async(data:any) => api.post('/auth/sendForgotPasswordOtp', data);
export const verifyForgotPasswordOtp = async(data:any) => api.post('/auth/verifyForgotPasswordOtp',data);
export const resetPassword = async(data:any) => api.post('/auth/resetPassword',data);