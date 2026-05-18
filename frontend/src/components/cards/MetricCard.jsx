import React from "react";
import { theme } from "../../styles/theme";

// Reusable metric card used across the dashboard
// Props:
//   title     — card label e.g. "Total Transactions"
//   value     — main number e.g. "284,807"
//   subtitle  — small text below value e.g. "last 24 hours"
//   icon      — lucide icon component
//   color     — accent color (defaults to primary blue)
//   trend     — optional trend text e.g. "+12% today"
//   trendUp   — true = green trend, false = red trend
//   loading   — shows skeleton while data loads

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  trendUp,
  loading = false,
}) => {
  const accentColor = color || theme.colors.primary;

  const styles = {
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
      transition: theme.transition,
      cursor: "default",
      flex: 1,
      minWidth: "200px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      margin: 0,
    },
    iconWrapper: {
      width: "40px",
      height: "40px",
      borderRadius: theme.radius.md,
      backgroundColor: `${accentColor}18`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    value: {
      fontSize: theme.fonts.sizes.xxxl,
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.textPrimary,
      margin: "0 0 4px 0",
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: 0,
    },
    trend: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: trendUp ? theme.colors.legitimate : theme.colors.fraud,
      backgroundColor: trendUp
        ? theme.colors.legitimateLight
        : theme.colors.fraudLight,
      padding: "2px 8px",
      borderRadius: theme.radius.full,
      marginTop: theme.spacing.sm,
    },
    skeleton: {
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      animation: "pulse 1.5s ease-in-out infinite",
    },
  };

  if (loading) {
    return (
      <div style={styles.card}>
        <div
          style={{
            ...styles.skeleton,
            height: "14px",
            width: "60%",
            marginBottom: "16px",
          }}
        />
        <div
          style={{
            ...styles.skeleton,
            height: "36px",
            width: "80%",
            marginBottom: "8px",
          }}
        />
        <div style={{ ...styles.skeleton, height: "12px", width: "50%" }} />
      </div>
    );
  }

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = theme.shadows.md)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = theme.shadows.sm)}
    >
      <div style={styles.header}>
        <p style={styles.title}>{title}</p>
        {Icon && (
          <div style={styles.iconWrapper}>
            <Icon size={20} color={accentColor} />
          </div>
        )}
      </div>

      <p style={styles.value}>{value}</p>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      {trend && (
        <div style={styles.trend}>
          <span>{trendUp ? "↑" : "↓"}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
