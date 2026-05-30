import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { theme } from "./styles/theme";
import { useAuth } from "./hooks/useAuth";
import { useTransactions } from "./hooks/useTransactions";
import { useBlockchain } from "./hooks/useBlockchain";
import { useMetaMask } from "./hooks/useMetaMask";
import LoginScreen from "./components/auth/LoginScreen";
import Sidebar from "./components/layout/Sidebar";
import StatusBar from "./components/layout/StatusBar";
import DashboardPage from "./pages/DashboardPage";
import BlockchainPage from "./pages/BlockchainPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import { checkHealth } from "./services/api";
import {
  notifyApiOnline,
  notifyApiOffline,
  notifyLogout,
} from "./utils/notification";

// ============================================================
// Status Bar — top bar showing API + blockchain status
// ============================================================
const TopBar = ({ apiStatus, blockchainStatus }) => {
  const styles = {
    bar: {
      position: "fixed",
      top: 0,
      left: "220px",
      right: 0,
      height: "48px",
      backgroundColor: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: `0 ${theme.spacing.xl}`,
      zIndex: 100,
      gap: theme.spacing.md,
    },
    item: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textSecondary,
    },
    dot: (online) => ({
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      backgroundColor: online ? theme.colors.legitimate : theme.colors.fraud,
    }),
    badge: {
      backgroundColor: theme.colors.blockchainLight,
      color: theme.colors.blockchain,
      padding: "2px 10px",
      borderRadius: theme.radius.full,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
    },
  };

  return (
    <div style={styles.bar}>
      <div style={styles.item}>
        <span style={styles.dot(apiStatus === "online")} />
        API {apiStatus === "online" ? "Online" : "Offline"}
      </div>
      <div style={styles.item}>
        <span style={styles.dot(blockchainStatus?.connected)} />
        Chain{" "}
        {blockchainStatus?.connected
          ? `#${blockchainStatus.block_number}`
          : "Offline"}
      </div>
      {blockchainStatus?.connected && (
        <span style={styles.badge}>
          {blockchainStatus.total_fraud_records || 0} on-chain
        </span>
      )}
    </div>
  );
};

// ============================================================
// Protected Route wrapper
// ============================================================
const ProtectedRoute = ({ children, adminOnly = false, user }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ============================================================
// Main App Layout (after login)
// ============================================================
const AppLayout = ({ user, onLogout }) => {
  const [apiStatus, setApiStatus] = useState("checking");
  const prevApiStatus = useRef(null);

  const {
    transactions,
    totalCount,
    fraudCount,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useTransactions(50);

  const { status: blockchainStatus } = useBlockchain();

  const {
    account: walletAccount,
    balance: walletBalance,
    connected: walletConnected,
    connecting: walletConnecting,
    error: walletError,
    txHistory,
    isMetaMaskInstalled,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useMetaMask();

  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setApiStatus("online");
        if (
          prevApiStatus.current === "offline" ||
          prevApiStatus.current === null
        ) {
          notifyApiOnline();
        }
        prevApiStatus.current = "online";
      } catch {
        setApiStatus("offline");
        if (
          prevApiStatus.current === "online" ||
          prevApiStatus.current === null
        ) {
          notifyApiOffline();
        }
        prevApiStatus.current = "offline";
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: #e2e8f0; border-radius: 3px;
    }
  `;

  const layoutStyle = {
    display: "flex",
    minHeight: "100vh",
    fontFamily: theme.fonts.family,
  };

  const mainStyle = {
    marginLeft: "220px",
    marginTop: "48px",
    flex: 1,
    backgroundColor: theme.colors.background,
    minHeight: "calc(100vh - 48px)",
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={layoutStyle}>
        {/* Sidebar */}
        <Sidebar user={user} onLogout={onLogout} />

        {/* Top status bar */}
        <TopBar apiStatus={apiStatus} blockchainStatus={blockchainStatus} />

        {/* Main content */}
        <main style={mainStyle}>
          <Routes>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <DashboardPage
                    user={user}
                    transactions={transactions}
                    totalCount={totalCount}
                    fraudCount={fraudCount}
                    loading={loading}
                    error={error}
                    lastUpdated={lastUpdated}
                    refresh={refresh}
                    blockchainStatus={blockchainStatus}
                  />
                </ProtectedRoute>
              }
            />

            {/* Blockchain — admin only */}
            <Route
              path="/blockchain"
              element={
                <ProtectedRoute user={user} adminOnly>
                  <BlockchainPage
                    blockchainStatus={blockchainStatus}
                    walletConnected={walletConnected}
                    walletAccount={walletAccount}
                    walletBalance={walletBalance}
                    walletConnecting={walletConnecting}
                    walletError={walletError}
                    txHistory={txHistory}
                    isMetaMaskInstalled={isMetaMaskInstalled}
                    onWalletConnect={connectWallet}
                    onWalletDisconnect={disconnectWallet}
                  />
                </ProtectedRoute>
              }
            />

            {/* Admin — admin only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Settings — analyst only */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute user={user}>
                  <SettingsPage user={user} />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

// ============================================================
// Root App
// ============================================================
export default function App() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogout = () => {
    notifyLogout();
    logout();
  };

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <LoginScreen onLogin={login} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}
