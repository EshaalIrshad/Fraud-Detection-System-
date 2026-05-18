// Helper functions used across multiple components
// Keeps components clean — no formatting logic inside JSX

// Convert decimal to percentage string
// 0.9979 → "99.79%"
export const toPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
};

// Format already-percentage number
// 99.7921 → "99.79%"
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(decimals)}%`;
};

// Format large numbers with commas
// 284807 → "284,807"
export const formatNumber = (value) => {
  if (value === null || value === undefined) return "N/A";
  return Number(value).toLocaleString();
};

// Format currency
// 88.35 → "€88.35"
export const formatCurrency = (value, currency = "€") => {
  if (value === null || value === undefined) return "N/A";
  return `${currency}${Number(value).toFixed(2)}`;
};

// Format timestamp to readable string
// "2026-05-12T11:28:42.849334" → "12 May 2026, 11:28:42"
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Format time ago
// "2026-05-12T11:28:42" → "2 minutes ago"
export const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Shorten blockchain address
// "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" → "0xf39F...2266"
export const shortenAddress = (address) => {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Shorten transaction hash
// "0xabc123...def456" → "0xabc1...f456"
export const shortenHash = (hash) => {
  if (!hash) return "N/A";
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

// Get colour based on fraud probability
// Used by transaction rows to colour code risk level
export const getRiskColor = (probability) => {
  if (probability >= 80) return "#dc2626"; // high risk — red
  if (probability >= 50) return "#d97706"; // medium risk — amber
  return "#16a34a"; // low risk — green
};

// Get risk label
export const getRiskLabel = (probability) => {
  if (probability >= 80) return "High";
  if (probability >= 50) return "Medium";
  return "Low";
};

// Format SHAP value for display
// 3.9407 → "+3.9407" or "-1.1691"
export const formatSHAP = (value) => {
  if (value === null || value === undefined) return "N/A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(4)}`;
};

// Format response time
// 79.28 → "79ms"
export const formatResponseTime = (ms) => {
  if (!ms) return "N/A";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};
