import React from "react";
import { theme } from "../../styles/theme";
import { useInvestigationSummary } from "../../hooks/useInvestigationSummary";
import { AlertTriangle, CheckCircle, Clock, Eye, Search } from "lucide-react";
import { timeAgo } from "../../utils/formatters";

const InvestigationSummary = () => {
  const { summary, investigations, loading, investigationsLoading } =
    useInvestigationSummary();

  const items = [
    {
      label: "Total Fraud Alerts",
      value: summary.total_fraud,
      icon: AlertTriangle,
      color: theme.colors.fraud,
      bg: theme.colors.fraudLight,
    },
    {
      label: "Needs Review",
      value: summary.unreviewed,
      icon: Eye,
      color: theme.colors.warning,
      bg: theme.colors.warningLight,
    },
    {
      label: "Under Review",
      value: summary.under_review,
      icon: Clock,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Confirmed Fraud",
      value: summary.confirmed,
      icon: AlertTriangle,
      color: theme.colors.fraud,
      bg: theme.colors.fraudLight,
    },
    {
      label: "False Positives",
      value: summary.false_positive,
      icon: CheckCircle,
      color: theme.colors.legitimate,
      bg: theme.colors.legitimateLight,
    },
    {
      label: "Flagged Suspicious",
      value: summary.suspicious ?? 0,
      icon: AlertTriangle,
      color: "#b45309",
      bg: "#fffbeb",
    },
  ];

  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: theme.spacing.lg,
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: theme.spacing.md,
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
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing.sm,
    },
    item: (bg) => ({
      backgroundColor: bg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
    }),
    iconBox: (color) => ({
      width: "32px",
      height: "32px",
      borderRadius: theme.radius.sm,
      backgroundColor: `${color}20`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    itemLabel: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: "0 0 2px 0",
    },
    itemValue: (color) => ({
      fontSize: theme.fonts.sizes.xl,
      fontWeight: theme.fonts.weights.bold,
      color: color,
      margin: 0,
      lineHeight: 1,
    }),
    urgentBanner: {
      backgroundColor: theme.colors.warningLight,
      border: `1px solid #fde68a`,
      borderRadius: theme.radius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      marginTop: theme.spacing.md,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.warning,
      fontWeight: theme.fonts.weights.medium,
    },
    divider: {
      height: "1px",
      backgroundColor: theme.colors.border,
      margin: `${theme.spacing.md} 0`,
    },
    sectionTitle: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      margin: "0 0 10px 0",
    },
    investigationRow: {
      padding: `${theme.spacing.sm} 0`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    investigationId: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textPrimary,
      fontFamily: "monospace",
      margin: "0 0 2px 0",
    },
    investigationMeta: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: "0 0 4px 0",
    },
    investigationReason: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
      margin: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    emptyNote: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      fontStyle: "italic",
      textAlign: "center",
      padding: `${theme.spacing.sm} 0`,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Search size={18} color={theme.colors.primary} />
        <div>
          <p style={styles.title}>Investigation Summary</p>
          <p style={styles.subtitle}>Session activity</p>
        </div>
      </div>

      {loading ? (
        <p
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.fonts.sizes.sm,
          }}
        >
          Loading...
        </p>
      ) : (
        <>
          {/* Stats grid */}
          <div style={styles.grid}>
            {items.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} style={styles.item(bg)}>
                <div style={styles.iconBox(color)}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <p style={styles.itemLabel}>{label}</p>
                  <p style={styles.itemValue(color)}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Urgent banner */}
          {summary.unreviewed > 0 && (
            <div style={styles.urgentBanner}>
              <AlertTriangle size={16} />
              {summary.unreviewed} fraud alert
              {summary.unreviewed > 1 ? "s" : ""} need
              {summary.unreviewed === 1 ? "s" : ""} your review
            </div>
          )}

          {/* Persisted suspicious flags from DB */}
          <div style={styles.divider} />
          <p style={styles.sectionTitle}>Flagged Investigations</p>

          {investigationsLoading ? (
            <p style={styles.emptyNote}>Loading...</p>
          ) : investigations.length === 0 ? (
            <p style={styles.emptyNote}>
              No transactions flagged as suspicious yet
            </p>
          ) : (
            investigations.slice(0, 5).map((inv) => (
              <div key={inv.id} style={styles.investigationRow}>
                <p style={styles.investigationId}>{inv.transaction_id}</p>
                <p style={styles.investigationMeta}>
                  Flagged by {inv.flagged_by} · {timeAgo(inv.created_at)}
                </p>
                <p style={styles.investigationReason}>"{inv.reason}"</p>
              </div>
            ))
          )}

          {investigations.length > 5 && (
            <p
              style={{
                fontSize: theme.fonts.sizes.xs,
                color: theme.colors.textMuted,
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              +{investigations.length - 5} more flagged transactions
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default InvestigationSummary;
