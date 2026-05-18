import React, { useState } from "react";
import { theme } from "../../styles/theme";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./TransactionModal";
import { RefreshCw, Filter } from "lucide-react";
import { timeAgo } from "../../utils/formatters";

const TransactionTable = ({
  transactions,
  loading,
  error,
  lastUpdated,
  onRefresh,
}) => {
  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = transactions.filter((tx) => {
    if (filter === "fraud") return tx.prediction === "FRAUD";
    if (filter === "legitimate") return tx.prediction === "LEGITIMATE";
    return true;
  });

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
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: 0,
    },
    subtitle: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: "2px 0 0 0",
    },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    filterBtn: (active) => ({
      padding: "4px 12px",
      borderRadius: theme.radius.full,
      border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
      backgroundColor: active ? theme.colors.primaryLight : "transparent",
      color: active ? theme.colors.primary : theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.sm,
      cursor: "pointer",
      fontWeight: active
        ? theme.fonts.weights.medium
        : theme.fonts.weights.normal,
      transition: theme.transition,
    }),
    refreshBtn: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 12px",
      borderRadius: theme.radius.full,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: "transparent",
      color: theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.sm,
      cursor: "pointer",
      transition: theme.transition,
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 120px 100px 120px 140px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      backgroundColor: theme.colors.background,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    tableHeaderCell: {
      padding: "0 8px",
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xxl,
      color: theme.colors.textMuted,
      fontSize: theme.fonts.sizes.md,
    },
    liveIndicator: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.legitimate,
    },
    liveDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: theme.colors.legitimate,
      animation: "pulse 2s infinite",
    },
  };

  return (
    <>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.title}>Live Transaction Feed</p>
            <p style={styles.subtitle}>
              {lastUpdated
                ? `Updated ${timeAgo(lastUpdated)}`
                : "Waiting for data..."}
            </p>
          </div>

          <div style={styles.controls}>
            {/* Live indicator */}
            <div style={styles.liveIndicator}>
              <div style={styles.liveDot} />
              <span>Live</span>
            </div>

            {/* Filter buttons */}
            {["all", "fraud", "legitimate"].map((f) => (
              <button
                key={f}
                style={styles.filterBtn(filter === f)}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}

            {/* Refresh button */}
            <button style={styles.refreshBtn} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table header */}
        <div style={styles.tableHeader}>
          {[
            "Transaction ID",
            "Time",
            "Prediction",
            "Fraud %",
            "Response",
            "Blockchain",
          ].map((h) => (
            <div key={h} style={styles.tableHeaderCell}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={styles.emptyState}>Loading transactions...</div>
        ) : error ? (
          <div style={{ ...styles.emptyState, color: theme.colors.fraud }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            No transactions yet — send a prediction to see results here
          </div>
        ) : (
          filtered.map((tx, i) => (
            <TransactionRow
              key={tx.transaction_id}
              transaction={tx}
              onClick={setSelectedTx}
              index={i}
            />
          ))
        )}
      </div>

      {/* Detail modal */}
      {selectedTx && (
        <TransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </>
  );
};

export default TransactionTable;
