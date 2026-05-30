import React from "react";
import { theme } from "../styles/theme";
import AuditLog from "../components/blockchain/AuditLog";
import TxExplorer from "../components/blockchain/TxExplorer";
import { Link, Shield, Activity } from "lucide-react";
import { shortenAddress } from "../utils/formatters";

const BlockchainPage = ({
  blockchainStatus,
  walletConnected,
  walletAccount,
  txHistory,
  isMetaMaskInstalled,
  onWalletConnect,
  onWalletDisconnect,
  walletConnecting,
  walletError,
}) => {
  const styles = {
    page: {
      padding: theme.spacing.xl,
    },
    pageTitle: {
      fontSize: theme.fonts.sizes.xxl,
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.textPrimary,
      margin: "0 0 4px 0",
    },
    pageSubtitle: {
      fontSize: theme.fonts.sizes.md,
      color: theme.colors.textMuted,
      margin: "0 0 24px 0",
    },
    statusGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    statusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.sm,
    },
    statusLabel: {
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      margin: "0 0 8px 0",
    },
    statusValue: {
      fontSize: theme.fonts.sizes.xl,
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.textPrimary,
      margin: "0 0 4px 0",
    },
    statusSub: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: 0,
    },
    dot: (online) => ({
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: online ? theme.colors.legitimate : theme.colors.fraud,
      marginRight: "6px",
    }),
    fullWidth: {
      marginBottom: theme.spacing.lg,
    },
    walletSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      boxShadow: theme.shadows.sm,
    },
    walletTitle: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: "0 0 16px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    connectBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.primary}`,
      backgroundColor: theme.colors.primaryLight,
      color: theme.colors.primary,
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.medium,
      cursor: "pointer",
    },
  };

  const connected = blockchainStatus?.connected;

  return (
    <div style={styles.page}>
      <p style={styles.pageTitle}>Blockchain Audit</p>
      <p style={styles.pageSubtitle}>
        Immutable fraud records on Hardhat local network
      </p>

      {/* Status cards */}
      <div style={styles.statusGrid}>
        <div style={styles.statusCard}>
          <p style={styles.statusLabel}>Network Status</p>
          <p style={styles.statusValue}>
            <span style={styles.dot(connected)} />
            {connected ? "Connected" : "Offline"}
          </p>
          <p style={styles.statusSub}>
            Chain ID: {blockchainStatus?.chain_id || "—"}
          </p>
        </div>

        <div style={styles.statusCard}>
          <p style={styles.statusLabel}>Total Fraud Records</p>
          <p style={styles.statusValue}>
            {blockchainStatus?.total_fraud_records || 0}
          </p>
          <p style={styles.statusSub}>Logged immutably on-chain</p>
        </div>

        <div style={styles.statusCard}>
          <p style={styles.statusLabel}>Latest Block</p>
          <p style={styles.statusValue}>
            #{blockchainStatus?.block_number || "—"}
          </p>
          <p style={styles.statusSub}>
            {blockchainStatus?.node_url || "http://127.0.0.1:8545"}
          </p>
        </div>
      </div>

      {/* MetaMask wallet section */}
      <div style={styles.walletSection}>
        <p style={styles.walletTitle}>
          <Shield size={18} color={theme.colors.blockchain} />
          Wallet Connection
        </p>

        {walletConnected ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.legitimateLight,
                border: `1px solid ${theme.colors.legitimateBorder}`,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.colors.legitimate,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.medium,
                  color: theme.colors.legitimate,
                  fontFamily: "monospace",
                }}
              >
                {shortenAddress(walletAccount)}
              </span>
            </div>
            <button
              onClick={onWalletDisconnect}
              style={{
                padding: "6px 14px",
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: "transparent",
                color: theme.colors.textMuted,
                fontSize: theme.fonts.sizes.sm,
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div>
            <p
              style={{
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textMuted,
                marginBottom: theme.spacing.md,
              }}
            >
              Connect MetaMask to watch live blockchain events as fraud is
              detected and logged in real time.
            </p>
            <button
              style={styles.connectBtn}
              onClick={onWalletConnect}
              disabled={walletConnecting}
            >
              🦊 {walletConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
            {walletError && (
              <p
                style={{
                  color: theme.colors.fraud,
                  fontSize: theme.fonts.sizes.sm,
                  marginTop: "8px",
                }}
              >
                {walletError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Live blockchain events */}
      {walletConnected && (
        <div style={styles.fullWidth}>
          <TxExplorer txHistory={txHistory} account={walletAccount} />
        </div>
      )}

      {/* Audit log */}
      <div style={styles.fullWidth}>
        <AuditLog />
      </div>
    </div>
  );
};

export default BlockchainPage;
