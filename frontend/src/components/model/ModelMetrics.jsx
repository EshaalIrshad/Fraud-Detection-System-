import React from "react";
import { theme } from "../../styles/theme";
import { useModelMetrics } from "../../hooks/useModelMetrics";
import { formatPercent } from "../../utils/formatters";
import { Brain, Target, TrendingUp, Award } from "lucide-react";

const ModelMetrics = () => {
  const { metrics, loading, error } = useModelMetrics();

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
    metricsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    metricItem: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    metricIcon: (color) => ({
      width: "36px",
      height: "36px",
      borderRadius: theme.radius.md,
      backgroundColor: `${color}18`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    metricLabel: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: "0 0 2px 0",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    metricValue: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.textPrimary,
      margin: 0,
    },
    divider: {
      height: "1px",
      backgroundColor: theme.colors.border,
      margin: `${theme.spacing.md} 0`,
    },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px",
    },
    infoLabel: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
    },
    infoValue: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textPrimary,
    },
    modelBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      backgroundColor: theme.colors.primaryLight,
      color: theme.colors.primary,
      borderRadius: theme.radius.full,
      padding: "4px 12px",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      marginBottom: theme.spacing.md,
    },
  };

  const metricItems = [
    {
      label: "Accuracy",
      value: metrics?.performance_metrics?.metrics?.accuracy,
      icon: Award,
      color: theme.colors.primary,
    },
    {
      label: "Precision",
      value: metrics?.performance_metrics?.metrics?.precision,
      icon: Target,
      color: theme.colors.legitimate,
    },
    {
      label: "Recall",
      value: metrics?.performance_metrics?.metrics?.recall,
      icon: TrendingUp,
      color: theme.colors.fraud,
    },
    {
      label: "F1 Score",
      value: metrics?.performance_metrics?.metrics?.f1_score,
      icon: Brain,
      color: theme.colors.blockchain,
    },
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.title}>Model Performance</p>
        <p
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.fonts.sizes.sm,
          }}
        >
          Loading metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.title}>Model Performance</p>
        <p
          style={{ color: theme.colors.fraud, fontSize: theme.fonts.sizes.sm }}
        >
          {error}
        </p>
      </div>
    );
  }

  const perfMetrics = metrics?.performance_metrics;
  const confMatrix = perfMetrics?.confusion_matrix;
  const trainInfo = perfMetrics?.training_info;

  return (
    <div style={styles.container}>
      <p style={styles.title}>Model Performance</p>
      <p style={styles.subtitle}>
        XGBoost trained on European Credit Card dataset
      </p>

      {/* Model badge */}
      <div style={styles.modelBadge}>
        <Brain size={14} />
        XGBoost v1.0 — SMOTE balanced
      </div>

      {/* Metrics grid */}
      <div style={styles.metricsGrid}>
        {metricItems.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={styles.metricItem}>
            <div style={styles.metricIcon(color)}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={styles.metricLabel}>{label}</p>
              <p style={styles.metricValue}>
                {value ? formatPercent(value) : "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      {/* Confusion matrix summary */}
      {confMatrix && (
        <>
          <p
            style={{
              fontSize: theme.fonts.sizes.sm,
              fontWeight: theme.fonts.weights.semibold,
              color: theme.colors.textSecondary,
              margin: "0 0 8px 0",
            }}
          >
            Test Set Results
          </p>
          {[
            [
              "Fraud caught (TP)",
              confMatrix.true_positives,
              theme.colors.legitimate,
            ],
            [
              "Fraud missed (FN)",
              confMatrix.false_negatives,
              theme.colors.fraud,
            ],
            [
              "False alarms (FP)",
              confMatrix.false_positives,
              theme.colors.warning,
            ],
            [
              "Correct clears (TN)",
              confMatrix.true_negatives,
              theme.colors.primary,
            ],
          ].map(([label, value, color]) => (
            <div key={label} style={styles.infoRow}>
              <span style={styles.infoLabel}>{label}</span>
              <span style={{ ...styles.infoValue, color }}>
                {Number(value).toLocaleString()}
              </span>
            </div>
          ))}
          <div style={styles.divider} />
        </>
      )}

      {/* Training info */}
      {trainInfo && (
        <>
          {[
            [
              "Training set size",
              Number(trainInfo.training_set_size).toLocaleString(),
            ],
            ["Training time", `${trainInfo.training_time_seconds}s`],
            ["SMOTE applied", trainInfo.smote_applied ? "Yes" : "No"],
            ["Trees (estimators)", trainInfo.n_estimators],
            ["Max tree depth", trainInfo.max_depth],
          ].map(([label, value]) => (
            <div key={label} style={styles.infoRow}>
              <span style={styles.infoLabel}>{label}</span>
              <span style={styles.infoValue}>{value}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ModelMetrics;
