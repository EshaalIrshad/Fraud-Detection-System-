import React from "react";
import { theme } from "../styles/theme";
import AuditLog from "../components/blockchain/AuditLog";
import { Shield, Database } from "lucide-react";

const BlockchainPage = ({ blockchainStatus }) => {
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
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
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
    infoBox: {
      backgroundColor: theme.colors.blockchainLight,
      border: `1px solid ${theme.colors.blockchain}30`,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      display: "flex",
      gap: theme.spacing.lg,
      alignItems: "flex-start",
    },
    infoIcon: {
      width: "40px",
      height: "40px",
      borderRadius: theme.radius.md,
      backgroundColor: `${theme.colors.blockchain}15`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    infoTitle: {
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.blockchain,
      margin: "0 0 6px 0",
    },
    infoText: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textSecondary,
      margin: 0,
      lineHeight: 1.6,
    },
    fullWidth: {
      marginBottom: theme.spacing.lg,
    },
    contractSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      boxShadow: theme.shadows.sm,
    },
    contractTitle: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: "0 0 16px 0",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    contractGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing.md,
    },
    contractItem: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.border}`,
    },
    contractLabel: {
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      margin: "0 0 6px 0",
    },
    contractValue: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textPrimary,
      fontFamily: "monospace",
      margin: 0,
      wordBreak: "break-all",
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
          <p style={styles.statusSub}>Current chain height</p>
        </div>
      </div>

      {/* How it works info box */}
      <div style={styles.infoBox}>
        <div style={styles.infoIcon}>
          <Shield size={20} color={theme.colors.blockchain} />
        </div>
        <div>
          <p style={styles.infoTitle}>How Blockchain Audit Logging Works</p>
          <p style={styles.infoText}>
            Every transaction flagged as fraud by the XGBoost model is
            automatically logged to the local Hardhat blockchain by the Flask
            backend. Each record is signed by the contract owner account and
            stored in the smart contract. Once written to the blockchain, no
            record can be altered or deleted.
          </p>
        </div>
      </div>

      {/* Audit log */}
      <div style={styles.fullWidth}>
        <AuditLog />
      </div>
    </div>
  );
};

export default BlockchainPage;
