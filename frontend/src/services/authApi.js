import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("fraudshield_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User Management (Admin only)
export const createAnalyst = async (data) => {
  const response = await authApi.post("/auth/create-analyst", data);
  return response.data;
};

export const getUsers = async () => {
  const response = await authApi.get("/auth/users");
  return response.data;
};

export const toggleUser = async (userId) => {
  const response = await authApi.put(`/auth/users/${userId}/toggle`);
  return response.data;
};

export const adminResetPassword = async (userId, newPassword) => {
  const response = await authApi.put(`/auth/users/${userId}/reset-password`, {
    new_password: newPassword,
  });
  return response.data;
};

// Password Requests
export const getPasswordRequests = async (status = "pending") => {
  const response = await authApi.get(
    `/auth/password-requests?status=${status}`,
  );
  return response.data;
};

export const resolvePasswordRequest = async (
  requestId,
  action,
  rejectReason = "",
) => {
  const response = await authApi.put(
    `/auth/password-requests/${requestId}/resolve`,
    { action, reject_reason: rejectReason },
  );
  return response.data;
};

export const submitPasswordRequest = async (newPassword, reason = "") => {
  const response = await authApi.post("/auth/password-request", {
    new_password: newPassword,
    reason,
  });
  return response.data;
};

export const getMyPasswordRequest = async () => {
  const response = await authApi.get("/auth/my-request");
  return response.data;
};

export default authApi;
