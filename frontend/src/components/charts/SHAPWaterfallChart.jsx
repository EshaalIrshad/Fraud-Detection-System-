import React from "react";
import { theme } from "../../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// Custom tooltip for the waterfall chart
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        boxShadow: theme.shadows.md,
        maxWidth: "220px",
      }}
    >
      <p
        style={{
          fontSize: theme.fonts.sizes.sm,
          fontWeight: theme.fonts.weights.semibold,
          color: theme.colors.textPrimary,
          margin: "0 0 6px 0",
          fontFamily: "monospace",
        }}
      >
        {data?.feature}
      </p>
      <p
        style={{
          fontSize: theme.fonts.sizes.sm,
          color: theme.colors.textSecondary,
          margin: "2px 0",
        }}
      >
        Feature value: {data?.featureValue?.toFixed(4)}
      </p>
      <p
        style={{
          fontSize: theme.fonts.sizes.sm,
          fontWeight: theme.fonts.weights.medium,
          color:
            data?.shapValue > 0 ? theme.colors.fraud : theme.colors.legitimate,
          margin: "2px 0",
        }}
      >
        SHAP: {data?.shapValue > 0 ? "+" : ""}
        {data?.shapValue?.toFixed(4)}
      </p>
      <p
        style={{
          fontSize: theme.fonts.sizes.xs,
          color:
            data?.shapValue > 0 ? theme.colors.fraud : theme.colors.legitimate,
          backgroundColor:
            data?.shapValue > 0
              ? theme.colors.fraudLight
              : theme.colors.legitimateLight,
          padding: "2px 6px",
          borderRadius: theme.radius.full,
          display: "inline-block",
          marginTop: "4px",
        }}
      >
        → {data?.direction}
      </p>
    </div>
  );
};

// Custom label renderer for bars
const CustomLabel = ({ x, y, width, value, index, data }) => {
  if (!data || !data[index]) return null;

  const item = data[index];
  const isPositive = item.shapValue > 0;
  const labelX = isPositive ? x + width + 6 : x - 6;
  const anchor = isPositive ? "start" : "end";

  return (
    <text
      x={labelX}
      y={y + 12}
      textAnchor={anchor}
      fontSize={11}
      fontFamily="monospace"
      fill={isPositive ? theme.colors.fraud : theme.colors.legitimate}
      fontWeight={500}
    >
      {isPositive ? "+" : ""}
      {item.shapValue?.toFixed(3)}
    </text>
  );
};

const SHAPWaterfallChart = ({ features, fraudProbability, prediction }) => {
  if (!features || features.length === 0) {
    return (
      <div
        style={{
          padding: theme.spacing.lg,
          textAlign: "center",
          color: theme.colors.textMuted,
          fontSize: theme.fonts.sizes.sm,
        }}
      >
        No SHAP data available
      </div>
    );
  }

  // Sort features by absolute SHAP value descending
  const sorted = [...features].sort(
    (a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value),
  );

  // Build chart data
  const chartData = sorted.map((f) => ({
    feature: f.feature,
    shapValue: f.shap_value,
    absValue: Math.abs(f.shap_value),
    featureValue: f.feature_value,
    direction: f.direction,
    // For bar positioning — positive bars extend right, negative left
    positiveBar: f.shap_value > 0 ? f.shap_value : 0,
    negativeBar: f.shap_value < 0 ? Math.abs(f.shap_value) : 0,
  }));

  // Calculate domain for x axis
  const maxAbs = Math.max(...chartData.map((d) => d.absValue));
  const domain = [-maxAbs * 1.3, maxAbs * 1.3];

  // Calculate cumulative impact
  const totalPositive = chartData
    .filter((d) => d.shapValue > 0)
    .reduce((sum, d) => sum + d.shapValue, 0);
  const totalNegative = chartData
    .filter((d) => d.shapValue < 0)
    .reduce((sum, d) => sum + Math.abs(d.shapValue), 0);

  const isFraud = prediction === 1 || prediction === "FRAUD";

  const styles = {
    container: {
      marginTop: theme.spacing.md,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: 0,
    },
    subtitle: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: "2px 0 0 0",
    },
    legend: {
      display: "flex",
      gap: theme.spacing.md,
    },
    legendItem: (color) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textSecondary,
    }),
    legendDot: (color) => ({
      width: "10px",
      height: "10px",
      borderRadius: "2px",
      backgroundColor: color,
    }),
    summaryRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.border}`,
    },
    summaryItem: {
      textAlign: "center",
    },
    summaryLabel: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      margin: "0 0 4px 0",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    summaryValue: (color) => ({
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.bold,
      color: color,
      margin: 0,
    }),
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.title}>SHAP Feature Contributions</p>
          <p style={styles.subtitle}>Why did the model make this prediction?</p>
        </div>
        <div style={styles.legend}>
          <div style={styles.legendItem()}>
            <span style={styles.legendDot(theme.colors.fraud)} />
            Pushes toward fraud
          </div>
          <div style={styles.legendItem()}>
            <span style={styles.legendDot(theme.colors.legitimate)} />
            Pushes toward legitimate
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 60, right: 80, top: 8, bottom: 8 }}
          barSize={18}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.border}
            vertical={true}
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={domain}
            tick={{ fontSize: 10, fill: theme.colors.textMuted }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{
              fontSize: 11,
              fill: theme.colors.textPrimary,
              fontFamily: "monospace",
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={0}
            stroke={theme.colors.textMuted}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />

          {/* Positive bars (fraud direction) */}
          <Bar
            dataKey="positiveBar"
            stackId="shap"
            radius={[0, 4, 4, 0]}
            isAnimationActive={true}
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`pos-${index}`}
                fill={
                  entry.positiveBar > 0 ? theme.colors.fraud : "transparent"
                }
                fillOpacity={0.85}
              />
            ))}
            <LabelList
              content={(props) => <CustomLabel {...props} data={chartData} />}
            />
          </Bar>

          {/* Negative bars (legitimate direction) */}
          <Bar
            dataKey="negativeBar"
            stackId="shap2"
            radius={[4, 0, 0, 4]}
            isAnimationActive={true}
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`neg-${index}`}
                fill={
                  entry.negativeBar > 0
                    ? theme.colors.legitimate
                    : "transparent"
                }
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary row */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryItem}>
          <p style={styles.summaryLabel}>Fraud signals</p>
          <p style={styles.summaryValue(theme.colors.fraud)}>
            +{totalPositive.toFixed(3)}
          </p>
        </div>
        <div style={styles.summaryItem}>
          <p style={styles.summaryLabel}>Legitimate signals</p>
          <p style={styles.summaryValue(theme.colors.legitimate)}>
            -{totalNegative.toFixed(3)}
          </p>
        </div>
        <div style={styles.summaryItem}>
          <p style={styles.summaryLabel}>Fraud probability</p>
          <p
            style={styles.summaryValue(
              isFraud ? theme.colors.fraud : theme.colors.legitimate,
            )}
          >
            {fraudProbability?.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default SHAPWaterfallChart;
