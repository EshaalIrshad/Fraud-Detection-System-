import React, { useState } from "react";
import { theme } from "../../styles/theme";
import { updateTransactionStatus, flagInvestigation } from "../../services/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Save,
} from "lucide-react";
import { formatTimestamp } from "../../utils/formatters";

// Status options for FRAUD transactions (in-memory, existing route)
const FRAUD_STATUS_CONFIG = {
  confirmed_fraud: {
    label: "Confirmed Fraud",
    color: theme.colors.fraud,
    bg: theme.colors.fraudLight,
    border: theme.colors.fraudBorder,
    icon: AlertTriangle,
  },
  false_positive: {
    label: "False Positive",
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    icon: CheckCircle,
  },
  under_review: {
    label: "Under Review",
    color: theme.colors.warning,
    bg: theme.colors.warningLight,
    border: "#fde68a",
    icon: Clock,
  },
};

const InvestigationPanel = ({ transaction, onStatusUpdated }) => {
  const queryClient = useQueryClient();
  const isFraud = transaction.prediction === "FRAUD";

  const currentStatus = transaction.investigation_status;
  const currentNotes = transaction.investigation_notes || "";

  const [selectedStatus, setSelectedStatus] = useState(currentStatus || null);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!currentStatus);

  // For legitimate transactions — track if already flagged
  const [flagged, setFlagged] = useState(false);

  const hasChanges = selectedStatus !== currentStatus || notes !== currentNotes;

  // FRAUD path — uses existing PUT route (in-memory)
  const handleSaveFraud = async () => {
    if (!selectedStatus) {
      toast.error("Please select an investigation status first");
      return;
    }
    setSaving(true);
    try {
      await updateTransactionStatus(
        transaction.transaction_id,
        selectedStatus,
        notes,
      );
      setSaved(true);
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["investigation-summary"]);
      toast.success(
        `Status set to ${FRAUD_STATUS_CONFIG[selectedStatus]?.label}`,
        {
          icon: "🔍",
        },
      );
      if (onStatusUpdated) onStatusUpdated(selectedStatus, notes);
    } catch (err) {
      toast.error("Failed to save investigation status");
    } finally {
      setSaving(false);
    }
  };

  // LEGITIMATE path — uses new POST route (persisted to DB)
  const handleFlagSuspicious = async () => {
    if (!notes.trim()) {
      toast.error("Please add a reason before flagging as suspicious");
      return;
    }
    setSaving(true);
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("fraudshield_user") || "{}",
      );
      const username = savedUser?.username || "analyst";
      await flagInvestigation(transaction.transaction_id, notes, username);
      setFlagged(true);
      setSaved(true);
      queryClient.invalidateQueries(["investigations"]);
      queryClient.invalidateQueries(["investigation-summary"]);
      toast.success("Transaction flagged for investigation", {
        icon: "🚩",
        style: {
          background: "#fffbeb",
          color: "#b45309",
          border: "1px solid #fde68a",
        },
      });
      if (onStatusUpdated) onStatusUpdated("suspicious", notes);
    } catch (err) {
      // Handle duplicate flag gracefully
      if (err.message?.includes("already flagged")) {
        toast.error("This transaction has already been flagged");
        setFlagged(true);
      } else {
        toast.error("Failed to flag transaction");
      }
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    container: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
    },
    title: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      margin: "0 0 12px 0",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    statusButtons: {
      display: "flex",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      flexWrap: "wrap",
    },
    statusBtn: (selected, color, bg, border) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 14px",
      borderRadius: theme.radius.md,
      border: `1.5px solid ${selected ? color : theme.colors.border}`,
      backgroundColor: selected ? bg : "transparent",
      color: selected ? color : theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: selected
        ? theme.fonts.weights.semibold
        : theme.fonts.weights.normal,
      cursor: "pointer",
      transition: theme.transition,
    }),
    notesLabel: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textSecondary,
      margin: "0 0 6px 0",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    notesInput: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.border}`,
      fontSize: theme.fonts.sizes.sm,
      fontFamily: theme.fonts.family,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
      resize: "vertical",
      minHeight: "80px",
      outline: "none",
      marginBottom: theme.spacing.md,
      transition: theme.transition,
      boxSizing: "border-box",
    },
    saveBtn: (enabled) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.radius.md,
      border: "none",
      backgroundColor: enabled ? theme.colors.primary : theme.colors.border,
      color: enabled ? "#ffffff" : theme.colors.textMuted,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      cursor: enabled ? "pointer" : "not-allowed",
      transition: theme.transition,
    }),
    suspiciousBtn: (enabled) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.radius.md,
      border: "none",
      backgroundColor: enabled ? "#b45309" : theme.colors.border,
      color: enabled ? "#ffffff" : theme.colors.textMuted,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      cursor: enabled ? "pointer" : "not-allowed",
      transition: theme.transition,
    }),
    savedBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 10px",
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.legitimateLight,
      color: theme.colors.legitimate,
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.medium,
      marginLeft: theme.spacing.sm,
    },
    flaggedBanner: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 14px",
      borderRadius: theme.radius.md,
      backgroundColor: "#fffbeb",
      border: "1px solid #fde68a",
      color: "#b45309",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      marginTop: theme.spacing.sm,
    },
    infoNote: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.md,
      fontStyle: "italic",
    },
  };

  // ── LEGITIMATE transaction — flag as suspicious only ──────
  if (!isFraud) {
    return (
      <div style={styles.container}>
        <p style={styles.title}>
          <FileText size={14} />
          Flag for Investigation
        </p>

        <p style={styles.infoNote}>
          This transaction was cleared as legitimate by the model. If you
          believe it may be suspicious, flag it below.
        </p>

        <p style={styles.notesLabel}>
          <FileText size={13} />
          Reason for flagging
        </p>
        <textarea
          style={styles.notesInput}
          placeholder="Explain why this transaction looks suspicious — e.g. unusual location, customer complaint, pattern matches known fraud..."
          value={notes}
          disabled={flagged || saved}
          onChange={(e) => setNotes(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary;
            e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}18`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.border;
            e.target.style.boxShadow = "none";
          }}
        />

        {flagged || saved ? (
          <div style={styles.flaggedBanner}>
            <AlertTriangle size={16} />
            Flagged for investigation — recorded in system
          </div>
        ) : (
          <button
            style={styles.suspiciousBtn(!saving && notes.trim().length > 0)}
            onClick={handleFlagSuspicious}
            disabled={saving || notes.trim().length === 0}
          >
            <AlertTriangle size={14} />
            {saving ? "Flagging..." : "Flag as Suspicious"}
          </button>
        )}
      </div>
    );
  }

  // ── FRAUD transaction — existing status workflow ──────────
  return (
    <div style={styles.container}>
      <p style={styles.title}>
        <FileText size={14} />
        Investigation Status
      </p>

      {/* Status buttons */}
      <div style={styles.statusButtons}>
        {Object.entries(FRAUD_STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const selected = selectedStatus === status;
          return (
            <button
              key={status}
              style={styles.statusBtn(
                selected,
                config.color,
                config.bg,
                config.border,
              )}
              onClick={() => {
                setSelectedStatus(status);
                setSaved(false);
              }}
            >
              <Icon size={14} />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <p style={styles.notesLabel}>
        <FileText size={13} />
        Investigation Notes
      </p>
      <textarea
        style={styles.notesInput}
        placeholder="Add your investigation notes here — e.g. verified with customer, unusual location, pattern matches known fraud ring..."
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.primary;
          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}18`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = theme.colors.border;
          e.target.style.boxShadow = "none";
        }}
      />

      {/* Save button */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          style={styles.saveBtn(hasChanges && !!selectedStatus)}
          onClick={handleSaveFraud}
          disabled={saving || !hasChanges || !selectedStatus}
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save Investigation"}
        </button>

        {saved && !hasChanges && (
          <span style={styles.savedBadge}>
            <CheckCircle size={12} />
            Saved
          </span>
        )}
      </div>

      {transaction.investigated_at && (
        <p
          style={{
            fontSize: theme.fonts.sizes.xs,
            color: theme.colors.textMuted,
            marginTop: "8px",
          }}
        >
          Last updated: {formatTimestamp(transaction.investigated_at)}
        </p>
      )}
    </div>
  );
};

export default InvestigationPanel;
