import React, { useState } from "react";
import { theme } from "../../styles/theme";
import { predictTransaction } from "../../services/api";
import {
  notifyFraudDetected,
  notifyLegitimate,
  notifyBlockchainLogged,
} from "../../utils/notification";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

const DemoPanel = ({ onTransactionSent }) => {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [lastTxnInfo, setLastTxnInfo] = useState(null);

  const sendTransaction = async (type) => {
    setSending(true);
    setLastResult(null);
    setLastTxnInfo(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/demo/random-transaction?type=${type}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transaction from API");
      }

      const { transaction_data, actual_label_text, index } =
        await response.json();

      const txnWithId = {
        ...transaction_data,
        transaction_id: `TXN_DEMO_${type.toUpperCase()}_${Date.now()}`,
      };

      const result = await predictTransaction(txnWithId);

      setLastResult(result);
      setLastTxnInfo({
        actual: actual_label_text,
        index: index,
        type: type,
      });

      if (result.prediction === 1) {
        notifyFraudDetected({
          ...result,
          transaction_id: txnWithId.transaction_id,
        });
        if (result.blockchain_result?.success) {
          setTimeout(() => {
            notifyBlockchainLogged(result.blockchain_result);
          }, 1000);
        }
      } else {
        notifyLegitimate(result);
      }

      if (onTransactionSent) onTransactionSent();
    } catch (err) {
      toast.error("Failed — make sure Flask is running on port 5000");
      setLastResult({
        error: "Failed — make sure Flask is running on port 5000",
      });
    } finally {
      setSending(false);
    }
  };

  const isFraud = lastResult?.prediction === 1;
  const modelCorrect =
    lastTxnInfo &&
    lastResult &&
    lastTxnInfo.actual === lastResult.prediction_label;

  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: "0 0 4px 0",
    },
    subtitle: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: "0 0 16px 0",
    },
    buttons: {
      display: "flex",
      gap: theme.spacing.sm,
      flexWrap: "wrap",
    },
    btn: (color, disabled) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.radius.md,
      border: `1px solid ${color}`,
      backgroundColor: disabled ? theme.colors.border : `${color}15`,
      color: disabled ? theme.colors.textMuted : color,
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.medium,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: theme.transition,
    }),
    result: (fraud) => ({
      marginTop: theme.spacing.md,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: fraud
        ? theme.colors.fraudLight
        : theme.colors.legitimateLight,
      border: `1px solid ${
        fraud ? theme.colors.fraudBorder : theme.colors.legitimateBorder
      }`,
    }),
    resultText: (fraud) => ({
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: fraud ? theme.colors.fraud : theme.colors.legitimate,
      margin: 0,
    }),
    resultSub: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: "4px 0 0 0",
    },
    correctBadge: (correct) => ({
      display: "inline-block",
      marginLeft: "8px",
      padding: "1px 6px",
      borderRadius: theme.radius.full,
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      backgroundColor: correct
        ? theme.colors.legitimateLight
        : theme.colors.fraudLight,
      color: correct ? theme.colors.legitimate : theme.colors.fraud,
    }),
    infoBox: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      marginBottom: theme.spacing.md,
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textSecondary,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
  };

  const BUTTONS = [
    {
      type: "fraud",
      label: "Send Fraud Sample",
      color: theme.colors.fraud,
    },
    {
      type: "legitimate",
      label: "Send Legitimate Sample",
      color: theme.colors.legitimate,
    },
    {
      type: "random",
      label: "Send Random Sample",
      color: theme.colors.primary,
    },
  ];

  return (
    <div style={styles.container}>
      <p style={styles.title}>Demo — Send Real Test Transaction</p>
      <p style={styles.subtitle}>
        Samples a real transaction from the test dataset and runs it through the
        full ML + blockchain pipeline
      </p>

      <div style={styles.infoBox}>
        <span>ℹ</span>
        <span>
          Transactions are randomly sampled from the test set. Results are
          genuine model predictions.
        </span>
      </div>

      <div style={styles.buttons}>
        {BUTTONS.map(({ type, label, color }) => (
          <button
            key={type}
            style={styles.btn(color, sending)}
            disabled={sending}
            onClick={() => sendTransaction(type)}
            onMouseEnter={(e) => {
              if (!sending) {
                e.currentTarget.style.backgroundColor = `${color}25`;
              }
            }}
            onMouseLeave={(e) => {
              if (!sending) {
                e.currentTarget.style.backgroundColor = `${color}15`;
              }
            }}
          >
            <Send size={14} />
            {sending ? "Processing..." : label}
          </button>
        ))}
      </div>

      {lastResult && !lastResult.error && (
        <div style={styles.result(isFraud)}>
          <p style={styles.resultText(isFraud)}>
            {isFraud
              ? `⚠ FRAUD detected — ${lastResult.fraud_probability}% probability`
              : `✓ LEGITIMATE — ${lastResult.confidence}% confidence`}
            {lastTxnInfo && (
              <span style={styles.correctBadge(modelCorrect)}>
                {modelCorrect ? "✓ Model correct" : "✗ Model incorrect"}
              </span>
            )}
          </p>
          <p style={styles.resultSub}>
            {lastTxnInfo && (
              <>
                Actual: <strong>{lastTxnInfo.actual}</strong>
                {" · "}
                Index: #{lastTxnInfo.index}
                {" · "}
              </>
            )}
            Response: {lastResult.response_time_ms}ms
            {lastResult.should_log_to_blockchain && " · ✓ Logged to blockchain"}
          </p>
        </div>
      )}

      {lastResult?.error && (
        <p
          style={{
            color: theme.colors.fraud,
            fontSize: theme.fonts.sizes.sm,
            margin: `${theme.spacing.sm} 0 0 0`,
          }}
        >
          {lastResult.error}
        </p>
      )}
    </div>
  );
};

export default DemoPanel;
