import api from "./api";

export const getUnreadNotificationCount = () => api.get("/notifications/unread-count");
export const getNotifications = () => api.get("/notifications");
export const markNotificationAsRead = (id: string) => api.patch(`/notifications/${id}/read`);   
export const markAllNotificationRead = () => api.patch(`/notifications/read`);   