import React from "react";
import { theme } from "../../styles/theme";
import { Shield, Activity, Link } from "lucide-react";
import WalletConnect from "./WalletConnect";

const Header = ({
  blockchainStatus,
  apiStatus,
  walletConnected,
  walletConnecting,
  walletAccount,
  walletBalance,
  walletChainId,
  walletError,
  isMetaMaskInstalled,
  onWalletConnect,
  onWalletDisconnect,
  user,
  onLogout,
}) => {
  const styles = {
    header: {
      backgroundColor: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: `0 ${theme.spacing.xl}`,
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: theme.shadows.sm,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    logoText: {
      fontSize: theme.fonts.sizes.xl,
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.primary,
      margin: 0,
    },
    logoSub: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: 0,
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    statusRow: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    statusItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textSecondary,
    },
    dot: (online) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: online ? theme.colors.legitimate : theme.colors.fraud,
    }),
    divider: {
      width: "1px",
      height: "24px",
      backgroundColor: theme.colors.border,
    },
  };

  const apiOnline = apiStatus === "online";
  const chainConnected = blockchainStatus?.connected;

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logo}>
        <Shield size={28} color={theme.colors.primary} />
        <div>
          <p style={styles.logoText}>FraudShield</p>
          <p style={styles.logoSub}>ML-Powered Fraud Detection</p>
        </div>
      </div>

      <div style={styles.rightSection}>
        {/* Status indicators */}
        <div style={styles.statusRow}>
          <div style={styles.statusItem}>
            <Activity size={14} />
            <span style={styles.dot(apiOnline)} />
            <span>API {apiOnline ? "Online" : "Offline"}</span>
          </div>

          <div style={styles.statusItem}>
            <Link size={14} />
            <span style={styles.dot(chainConnected)} />
            <span>
              Chain{" "}
              {chainConnected
                ? `#${blockchainStatus?.block_number}`
                : "Offline"}
            </span>
          </div>

          {chainConnected && (
            <div style={styles.statusItem}>
              <span
                style={{
                  backgroundColor: theme.colors.blockchainLight,
                  color: theme.colors.blockchain,
                  padding: "2px 10px",
                  borderRadius: theme.radius.full,
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.medium,
                }}
              >
                {blockchainStatus?.total_fraud_records || 0} on-chain
              </span>
            </div>
          )}
        </div>

        <div style={styles.divider} />

        {/* MetaMask wallet connect */}
        <WalletConnect
          connected={walletConnected}
          connecting={walletConnecting}
          account={walletAccount}
          balance={walletBalance}
          chainId={walletChainId}
          error={walletError}
          onConnect={onWalletConnect}
          onDisconnect={onWalletDisconnect}
          isMetaMaskInstalled={isMetaMaskInstalled}
        />

        {/* User info + logout */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: theme.radius.full,
                backgroundColor: `${user.color}15`,
                border: `1px solid ${user.color}30`,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: user.color,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.medium,
                  color: user.color,
                }}
              >
                {user.name}
              </span>
              <span
                style={{
                  fontSize: theme.fonts.sizes.xs,
                  color: theme.colors.textMuted,
                }}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: theme.radius.full,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: "transparent",
                color: theme.colors.textMuted,
                fontSize: theme.fonts.sizes.sm,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
