import React from "react";
import { theme } from "../../styles/theme";
import {
  formatPercent,
  formatTimestamp,
  timeAgo,
  formatResponseTime,
  getRiskColor,
  getRiskLabel,
} from "../../utils/formatters";
import BlockchainBadge from "../cards/BlockchainBadge";

// Single row in the transaction table
// Props:
//   transaction — transaction object from Flask
//   onClick     — opens the detail modal
//   index       — for alternating row colors

const TransactionRow = ({ transaction, onClick, index }) => {
  const isFraud = transaction.prediction === "FRAUD";
  const riskColor = getRiskColor(transaction.fraud_probability);

  const styles = {
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 120px 100px 120px 140px",
      alignItems: "center",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      backgroundColor:
        index % 2 === 0 ? theme.colors.surface : theme.colors.background,
      borderBottom: `1px solid ${theme.colors.border}`,
      cursor: "pointer",
      transition: theme.transition,
      borderLeft: isFraud
        ? `3px solid ${theme.colors.fraud}`
        : `3px solid transparent`,
    },
    cell: {
      fontSize: theme.fonts.sizes.md,
      color: theme.colors.textPrimary,
      padding: "0 8px",
    },
    txId: {
      fontFamily: "monospace",
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.primary,
      fontWeight: theme.fonts.weights.medium,
    },
    badge: (fraud) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "3px 10px",
      borderRadius: theme.radius.full,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
      backgroundColor: fraud
        ? theme.colors.fraudLight
        : theme.colors.legitimateLight,
      color: fraud ? theme.colors.fraud : theme.colors.legitimate,
    }),
    probability: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
      color: riskColor,
    },
    time: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
    },
    responseTime: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
    },
  };

  return (
    <div
      style={styles.row}
      onClick={() => onClick(transaction)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
          index % 2 === 0 ? theme.colors.surface : theme.colors.background;
      }}
    >
      {/* Transaction ID */}
      <div style={{ ...styles.cell, ...styles.txId }}>
        {transaction.transaction_id}
      </div>

      {/* Time */}
      <div style={{ ...styles.cell, ...styles.time }}>
        {timeAgo(transaction.timestamp)}
      </div>

      {/* Prediction badge */}
      <div style={styles.cell}>
        <span style={styles.badge(isFraud)}>
          {isFraud ? "⚠ FRAUD" : "✓ CLEAR"}
        </span>
      </div>

      {/* Fraud probability */}
      <div style={{ ...styles.cell, ...styles.probability }}>
        {formatPercent(transaction.fraud_probability)}
      </div>

      {/* Response time */}
      <div style={{ ...styles.cell, ...styles.responseTime }}>
        {formatResponseTime(transaction.response_time_ms)}
      </div>

      {/* Blockchain status */}
      <div style={styles.cell}>
        {transaction.logged_to_blockchain ? (
          <BlockchainBadge small />
        ) : (
          <span
            style={{
              fontSize: theme.fonts.sizes.xs,
              color: theme.colors.textMuted,
            }}
          >
            —
          </span>
        )}
      </div>
    </div>
  );
};

export default TransactionRow;
