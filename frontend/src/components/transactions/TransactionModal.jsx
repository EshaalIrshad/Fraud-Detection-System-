import React from "react";
import { theme } from "../../styles/theme";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import BlockchainBadge from "../cards/BlockchainBadge";
import {
  formatPercent,
  formatTimestamp,
  formatResponseTime,
  formatSHAP,
} from "../../utils/formatters";

// Full detail popup when user clicks a transaction
// Shows prediction, confidence, SHAP features, blockchain info

const TransactionModal = ({ transaction, onClose }) => {
  const isFraud = transaction.prediction === "FRAUD";

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      boxShadow: theme.shadows.lg,
      width: "560px",
      maxHeight: "85vh",
      overflowY: "auto",
      padding: theme.spacing.xl,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.lg,
    },
    closeBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: theme.colors.textMuted,
      padding: "4px",
      borderRadius: theme.radius.sm,
    },
    predictionBanner: {
      backgroundColor: isFraud
        ? theme.colors.fraudLight
        : theme.colors.legitimateLight,
      border: `1px solid ${
        isFraud ? theme.colors.fraudBorder : theme.colors.legitimateBorder
      }`,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    predictionText: {
      fontSize: theme.fonts.sizes.xl,
      fontWeight: theme.fonts.weights.bold,
      color: isFraud ? theme.colors.fraud : theme.colors.legitimate,
      margin: 0,
    },
    confidenceText: {
      fontSize: theme.fonts.sizes.md,
      color: theme.colors.textSecondary,
      margin: "4px 0 0 0",
    },
    sectionTitle: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: theme.spacing.sm,
    },
    detailGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    detailItem: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
    },
    detailLabel: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: "0 0 2px 0",
    },
    detailValue: {
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textPrimary,
      margin: 0,
      fontFamily: "monospace",
    },
    featureRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${theme.spacing.sm} 0`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    featureName: {
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textPrimary,
      fontFamily: "monospace",
    },
    shapBar: (value) => ({
      height: "6px",
      width: `${Math.min(Math.abs(value) * 30, 100)}px`,
      backgroundColor: value > 0 ? theme.colors.fraud : theme.colors.legitimate,
      borderRadius: theme.radius.full,
      display: "inline-block",
      marginRight: "8px",
    }),
    shapValue: (value) => ({
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: value > 0 ? theme.colors.fraud : theme.colors.legitimate,
    }),
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p
              style={{
                fontSize: theme.fonts.sizes.lg,
                fontWeight: theme.fonts.weights.semibold,
                margin: 0,
                color: theme.colors.textPrimary,
              }}
            >
              Transaction Details
            </p>
            <p
              style={{
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textMuted,
                margin: "2px 0 0 0",
                fontFamily: "monospace",
              }}
            >
              {transaction.transaction_id}
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Prediction banner */}
        <div style={styles.predictionBanner}>
          {isFraud ? (
            <AlertTriangle size={32} color={theme.colors.fraud} />
          ) : (
            <CheckCircle size={32} color={theme.colors.legitimate} />
          )}
          <div>
            <p style={styles.predictionText}>
              {isFraud ? "⚠ Fraud Detected" : "✓ Transaction Clear"}
            </p>
            <p style={styles.confidenceText}>
              Confidence: {formatPercent(transaction.confidence)}
              {" | "}
              Fraud probability: {formatPercent(transaction.fraud_probability)}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <p style={styles.sectionTitle}>Transaction Info</p>
        <div style={styles.detailGrid}>
          {[
            ["Timestamp", formatTimestamp(transaction.timestamp)],
            ["Response Time", formatResponseTime(transaction.response_time_ms)],
            [
              "Prediction",
              transaction.prediction_label || transaction.prediction,
            ],
            ["On Blockchain", transaction.logged_to_blockchain ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} style={styles.detailItem}>
              <p style={styles.detailLabel}>{label}</p>
              <p style={styles.detailValue}>{value}</p>
            </div>
          ))}
        </div>

        {/* SHAP Features */}
        {transaction.top_features && (
          <>
            <p style={styles.sectionTitle}>
              Why this prediction? (SHAP Explanation)
            </p>
            {transaction.top_features.map((f, i) => (
              <div key={i} style={styles.featureRow}>
                <span style={styles.featureName}>{f.feature}</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={styles.shapBar(f.shap_value)} />
                  <span style={styles.shapValue(f.shap_value)}>
                    {formatSHAP(f.shap_value)}
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: theme.fonts.sizes.xs,
                      color:
                        f.direction === "FRAUD"
                          ? theme.colors.fraud
                          : theme.colors.legitimate,
                      fontWeight: theme.fonts.weights.medium,
                    }}
                  >
                    → {f.direction}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Blockchain info */}
        {transaction.logged_to_blockchain && (
          <div style={{ marginTop: theme.spacing.lg }}>
            <p style={styles.sectionTitle}>Blockchain Audit Record</p>
            <BlockchainBadge
              txHash={transaction.blockchain_result?.transaction_hash}
              recordId={transaction.blockchain_result?.record_id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
