import React, { useState, useMemo } from "react";
import { theme } from "../../styles/theme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const generateTrendData = (transactions) => {
  if (!transactions || transactions.length === 0) return [];

  const groups = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    const key = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = { time: key, total: 0, fraud: 0, legitimate: 0 };
    }
    groups[key].total++;
    if (tx.prediction === "FRAUD") groups[key].fraud++;
    else groups[key].legitimate++;
  });

  const sorted = Object.values(groups).sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  // Need at least 2 points for a line
  if (sorted.length === 1) {
    sorted.unshift({
      time: "start",
      total: 0,
      fraud: 0,
      legitimate: 0,
    });
  }

  return sorted;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        boxShadow: theme.shadows.md,
      }}
    >
      <p
        style={{
          fontSize: theme.fonts.sizes.sm,
          fontWeight: theme.fonts.weights.semibold,
          color: theme.colors.textPrimary,
          margin: "0 0 6px 0",
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            fontSize: theme.fonts.sizes.sm,
            color: entry.color,
            margin: "2px 0",
          }}
        >
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const FraudTrendChart = ({ transactions }) => {
  const [activeLines, setActiveLines] = useState({
    total: true,
    fraud: true,
    legitimate: false,
  });

  const data = useMemo(() => generateTrendData(transactions), [transactions]);

  const hasData = data.length >= 2;

  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing.lg,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.lg,
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
      margin: 0,
    },
    toggles: {
      display: "flex",
      gap: theme.spacing.sm,
    },
    toggleBtn: (active, color) => ({
      padding: "3px 10px",
      borderRadius: theme.radius.full,
      border: `1px solid ${active ? color : theme.colors.border}`,
      backgroundColor: active ? `${color}18` : "transparent",
      color: active ? color : theme.colors.textMuted,
      fontSize: theme.fonts.sizes.sm,
      cursor: "pointer",
      transition: theme.transition,
      fontWeight: active
        ? theme.fonts.weights.medium
        : theme.fonts.weights.normal,
    }),
    emptyState: {
      height: "220px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: theme.colors.textMuted,
      gap: "8px",
    },
    emptyIcon: {
      fontSize: "32px",
    },
    emptyText: {
      fontSize: theme.fonts.sizes.md,
      margin: 0,
    },
    emptyHint: {
      fontSize: theme.fonts.sizes.sm,
      margin: 0,
      color: theme.colors.textMuted,
    },
  };

  const toggleLine = (name) => {
    setActiveLines((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.title}>Transaction Trend</p>
          <p style={styles.subtitle}>
            {hasData
              ? `${transactions.length} transactions this session`
              : "Send transactions to see live trend data"}
          </p>
        </div>

        {/* Only show toggles when there is real data */}
        {hasData && (
          <div style={styles.toggles}>
            {[
              ["total", "Total", theme.colors.primary],
              ["fraud", "Fraud", theme.colors.fraud],
              ["legitimate", "Legitimate", theme.colors.legitimate],
            ].map(([key, label, color]) => (
              <button
                key={key}
                style={styles.toggleBtn(activeLines[key], color)}
                onClick={() => toggleLine(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📊</span>
          <p style={styles.emptyText}>No transaction data yet</p>
          <p style={styles.emptyHint}>
            Use the demo panel to send transactions
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.colors.border}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: theme.colors.textMuted }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: theme.colors.textMuted }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            {activeLines.total && (
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke={theme.colors.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {activeLines.fraud && (
              <Line
                type="monotone"
                dataKey="fraud"
                name="Fraud"
                stroke={theme.colors.fraud}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                strokeDasharray="4 2"
              />
            )}
            {activeLines.legitimate && (
              <Line
                type="monotone"
                dataKey="legitimate"
                name="Legitimate"
                stroke={theme.colors.legitimate}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FraudTrendChart;
