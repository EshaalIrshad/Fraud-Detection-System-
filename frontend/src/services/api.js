import axios from "axios";

// All Flask API calls live here
// Components never hardcode URLs — they always use this file

const BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fraudshield_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Health
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

// Predictions
export const predictTransaction = async (transactionData) => {
  const response = await api.post("/predict", transactionData);
  return response.data;
};

export const predictBatch = async (transactions) => {
  const response = await api.post("/predict/batch", { transactions });
  return response.data;
};

// Transaction history
export const getTransactions = async (limit = 20, filter = "all") => {
  const response = await api.get("/transactions", {
    params: { limit, filter },
  });
  return response.data;
};

// Model info
export const getModelInfo = async () => {
  const response = await api.get("/model");
  return response.data;
};

// Blockchain
export const getBlockchainStatus = async () => {
  const response = await api.get("/blockchain/status");
  return response.data;
};

export const getBlockchainRecord = async (recordId) => {
  const response = await api.get(`/blockchain/record/${recordId}`);
  return response.data;
};

// Investigation status
export const updateTransactionStatus = async (transactionId, status, notes) => {
  const response = await api.put(`/transactions/${transactionId}/status`, {
    status,
    notes,
  });
  return response.data;
};

export const getInvestigationSummary = async () => {
  const response = await api.get("/transactions/investigation-summary");
  return response.data;
};
// Flag a legitimate transaction as suspicious — persists to DB
export const flagInvestigation = async (transactionId, reason, flaggedBy) => {
  const response = await api.post("/investigations", {
    transaction_id: transactionId,
    reason: reason,
    flagged_by: flaggedBy,
  });
  return response.data;
};

// Get all persisted investigations from DB
export const getInvestigations = async () => {
  const response = await api.get("/investigations");
  return response.data;
};
export default api;
