import api from "./api";

export const createOrder = (data: object) => api.post(`/payments/create-order`, data);

export const verifyPayment = (data:object) => api.post('/payments/verify-payment', data); 


export const createOrderForPlan = (data:object) => api.post(`/payments/create-order-for-plan`, data);