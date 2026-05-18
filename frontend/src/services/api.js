import axios from "axios";

// All Flask API calls live here
// Components never hardcode URLs — they always use this file
// If Flask port changes, only update BASE_URL here

const BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// Health
// ============================================================
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

// ============================================================
// Predictions
// ============================================================
export const predictTransaction = async (transactionData) => {
  const response = await api.post("/predict", transactionData);
  return response.data;
};

export const predictBatch = async (transactions) => {
  const response = await api.post("/predict/batch", { transactions });
  return response.data;
};

// ============================================================
// Transaction history
// ============================================================
export const getTransactions = async (limit = 20, filter = "all") => {
  const response = await api.get("/transactions", {
    params: { limit, filter },
  });
  return response.data;
};

// ============================================================
// Model info
// ============================================================
export const getModelInfo = async () => {
  const response = await api.get("/model");
  return response.data;
};

// ============================================================
// Blockchain
// ============================================================
export const getBlockchainStatus = async () => {
  const response = await api.get("/blockchain/status");
  return response.data;
};

export const getBlockchainRecord = async (recordId) => {
  const response = await api.get(`/blockchain/record/${recordId}`);
  return response.data;
};

export const testFraudSample = async () => {
  const response = await api.get("/test/fraud-sample");
  return response.data;
};

export default api;
