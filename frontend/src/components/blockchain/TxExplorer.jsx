import React from "react";
import { theme } from "../../styles/theme";
import { Activity } from "lucide-react";
import { formatTimestamp, shortenHash } from "../../utils/formatters";

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
    liveDot: {
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: theme.colors.legitimate,
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
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xl,
      color: theme.colors.textMuted,
      fontSize: theme.fonts.sizes.sm,
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "70px 1fr 160px 90px 100px",
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
    row: (isNew) => ({
      display: "grid",
      gridTemplateColumns: "70px 1fr 160px 90px 100px",
      alignItems: "center",
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: isNew ? theme.colors.blockchainLight : "transparent",
      transition: "background-color 0.3s",
    }),
    blockNum: {
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.blockchain,
      fontFamily: "monospace",
      fontSize: theme.fonts.sizes.sm,
    },
    txHash: {
      fontFamily: "monospace",
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textSecondary,
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    hashCopied: {
      fontSize: "10px",
      color: theme.colors.legitimate,
    },
    eventBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 8px",
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.fraudLight,
      color: theme.colors.fraud,
      fontSize: "10px",
      fontWeight: theme.fonts.weights.semibold,
    },
    gas: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      fontFamily: "monospace",
    },
    time: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
    },
  };

  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const handleCopyHash = (hash, index) => {
    navigator.clipboard.writeText(hash);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
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

      {/* Table */}
      {txHistory.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ margin: "0 0 4px 0" }}>
            ⛓ Waiting for blockchain events...
          </p>
          <p style={{ margin: 0, fontSize: theme.fonts.sizes.xs }}>
            Send a fraud transaction to see live on-chain events here
          </p>
        </div>
      ) : (
        <>
          <div style={styles.tableHeader}>
            {["Block", "Tx Hash", "Event", "Gas Used", "Time"].map((h) => (
              <span key={h} style={styles.headerCell}>
                {h}
              </span>
            ))}
          </div>

          {txHistory.map((tx, i) => (
            <div key={i} style={styles.row(i === 0)}>
              {/* Block number */}
              <span style={styles.blockNum}>#{tx.blockNumber ?? "—"}</span>

              {/* Tx hash — clickable to copy */}
              <span
                style={{ ...styles.txHash, cursor: "pointer" }}
                onClick={() => handleCopyHash(tx.transactionHash ?? "", i)}
                title="Click to copy full hash"
              >
                <span style={{ color: theme.colors.blockchain }}>
                  {tx.transactionHash ? shortenHash(tx.transactionHash) : "—"}
                </span>
                {copiedIndex === i ? (
                  <span style={styles.hashCopied}>✓ copied</span>
                ) : (
                  <span
                    style={{ fontSize: "10px", color: theme.colors.textMuted }}
                  >
                    copy
                  </span>
                )}
              </span>

              {/* Event type */}
              <span style={styles.eventBadge}>⚠ FraudLogged</span>

              {/* Gas used */}
              <span style={styles.gas}>
                {tx.gasUsed ? Number(tx.gasUsed).toLocaleString() : "—"}
              </span>

              {/* Timestamp */}
              <span style={styles.time}>
                {tx.timestamp ? formatTimestamp(tx.timestamp) : "—"}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TxExplorer;
