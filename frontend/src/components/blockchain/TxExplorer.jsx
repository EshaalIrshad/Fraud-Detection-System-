import React from "react";
import { theme } from "../../styles/theme";
import { ExternalLink, Activity } from "lucide-react";
import { shortenHash, formatTimestamp } from "../../utils/formatters";

const TxExplorer = ({ txHistory, account }) => {
  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
      overflow: "hidden",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.blockchainLight,
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.blockchain,
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xl,
      color: theme.colors.textMuted,
      fontSize: theme.fonts.sizes.sm,
    },
    txRow: {
      display: "grid",
      gridTemplateColumns: "80px 1fr 1fr 120px",
      alignItems: "center",
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: theme.fonts.sizes.sm,
    },
    txRowHeader: {
      display: "grid",
      gridTemplateColumns: "80px 1fr 1fr 120px",
      padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.background,
    },
    headerCell: {
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    recordId: {
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.blockchain,
      fontFamily: "monospace",
    },
    txId: {
      fontFamily: "monospace",
      color: theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.xs,
    },
    confidence: {
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.fraud,
    },
    time: {
      color: theme.colors.textMuted,
      fontSize: theme.fonts.sizes.xs,
    },
    liveDot: {
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: theme.colors.legitimate,
      marginRight: "6px",
      animation: "pulse 2s infinite",
    },
    walletInfo: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      fontFamily: "monospace",
      backgroundColor: theme.colors.background,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.title}>
          <Activity size={18} />
          Live Blockchain Events
          <span style={styles.liveDot} />
        </p>
        <span
          style={{
            fontSize: theme.fonts.sizes.xs,
            color: theme.colors.blockchain,
            backgroundColor: theme.colors.surface,
            padding: "2px 8px",
            borderRadius: theme.radius.full,
            border: `1px solid ${theme.colors.blockchain}30`,
          }}
        >
          Chain ID: 1337
        </span>
      </div>

      {/* Wallet info */}
      {account && <div style={styles.walletInfo}>Watching: {account}</div>}

      {/* Table header */}
      {txHistory.length > 0 && (
        <div style={styles.txRowHeader}>
          {["Record #", "Transaction ID", "Confidence", "Time"].map((h) => (
            <span key={h} style={styles.headerCell}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Transactions */}
      {txHistory.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ margin: "0 0 4px 0" }}>
            ⛓ Waiting for blockchain events...
          </p>
          <p style={{ margin: 0, fontSize: theme.fonts.sizes.xs }}>
            Send a fraud transaction to see live events here
          </p>
        </div>
      ) : (
        txHistory.map((tx, i) => (
          <div
            key={i}
            style={{
              ...styles.txRow,
              backgroundColor:
                i === 0 ? theme.colors.blockchainLight : "transparent",
            }}
          >
            <span style={styles.recordId}>#{tx.recordId}</span>
            <span style={styles.txId}>{tx.transactionId}</span>
            <span style={styles.confidence}>{tx.confidence}%</span>
            <span style={styles.time}>{formatTimestamp(tx.timestamp)}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default TxExplorer;
