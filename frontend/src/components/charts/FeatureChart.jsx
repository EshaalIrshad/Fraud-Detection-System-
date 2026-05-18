import React from "react";
import { theme } from "../../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Top 10 SHAP feature importance chart
// Data comes from model_results.json saved in Sprint 2

const FEATURE_DATA = [
  { feature: "V14", shap: 1.7189 },
  { feature: "V4", shap: 1.109 },
  { feature: "V12", shap: 0.5358 },
  { feature: "V8", shap: 0.4638 },
  { feature: "V11", shap: 0.4356 },
  { feature: "V10", shap: 0.4286 },
  { feature: "V3", shap: 0.398 },
  { feature: "V1", shap: 0.3818 },
  { feature: "V18", shap: 0.3544 },
  { feature: "V17", shap: 0.2442 },
];

const CustomTooltip = ({ active, payload }) => {
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
          margin: "0 0 4px 0",
        }}
      >
        {payload[0]?.payload?.feature}
      </p>
      <p
        style={{
          fontSize: theme.fonts.sizes.sm,
          color: theme.colors.primary,
          margin: 0,
        }}
      >
        Mean |SHAP|: {payload[0]?.value?.toFixed(4)}
      </p>
    </div>
  );
};

const FeatureChart = ({ topFeatures }) => {
  // Use dynamic data from model if available
  // Otherwise fall back to hardcoded Sprint 2 results
  const data =
    topFeatures?.length > 0
      ? topFeatures.map((f) => ({
          feature: f.Feature,
          shap: parseFloat(f.Mean_SHAP.toFixed(4)),
        }))
      : FEATURE_DATA;

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
  };

  // Colour bars by importance rank
  const getBarColor = (index) => {
    if (index === 0) return theme.colors.fraud;
    if (index === 1) return theme.colors.warning;
    if (index <= 3) return theme.colors.primary;
    return `${theme.colors.primary}80`;
  };

  return (
    <div style={styles.container}>
      <p style={styles.title}>Feature Importance</p>
      <p style={styles.subtitle}>
        Mean absolute SHAP values — top fraud signals
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.border}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: theme.colors.textMuted }}
            axisLine={false}
            tickLine={false}
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
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p
        style={{
          fontSize: theme.fonts.sizes.xs,
          color: theme.colors.textMuted,
          margin: "8px 0 0 0",
          textAlign: "center",
        }}
      >
        V14 is the strongest fraud signal — abnormal values indicate high fraud
        probability
      </p>
    </div>
  );
};

export default FeatureChart;
