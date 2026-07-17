import React from "react";
import { theme } from "../styles/theme";
import MetricCard from "../components/cards/MetricCard";
import DemoPanel from "../components/demo/DemoPanel";
import TransactionTable from "../components/transactions/TransactionTable";
import FraudTrendChart from "../components/charts/FraudTrendChart";
import FeatureChart from "../components/charts/FeatureChart";
import { Activity, AlertTriangle, ShieldCheck, Link } from "lucide-react";
import { formatNumber, formatPercent } from "../utils/formatters";
import InvestigationSummary from "../components/analyst/InvestigationSummary";
import PasswordRequest from "../components/analyst/PasswordRequest";

const DashboardPage = ({
  user,
  transactions,
  totalCount,
  fraudCount,
  loading,
  error,
  lastUpdated,
  refresh,
  blockchainStatus,
  metrics,
}) => {
  const fraudRate = totalCount > 0 ? fraudCount / totalCount : 0;
  const chainRecords = blockchainStatus?.total_fraud_records || 0;

  const styles = {
    page: {
      padding: theme.spacing.xl,
    },
    pageTitle: {
      fontSize: theme.fonts.sizes.xxl,
      fontWeight: theme.fonts.weights.bold,
      color: theme.colors.textPrimary,
      margin: "0 0 4px 0",
    },
    pageSubtitle: {
      fontSize: theme.fonts.sizes.md,
      color: theme.colors.textMuted,
      margin: "0 0 24px 0",
    },
    metricsRow: {
      display: "flex",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      alignItems: "start",
    },
    fullWidth: {
      marginBottom: theme.spacing.lg,
    },
  };

  return (
    <div style={styles.page}>
      <p style={styles.pageTitle}>Dashboard</p>
      <p style={styles.pageSubtitle}>Live fraud detection monitoring</p>

      {/* Metric cards */}
      <div style={styles.metricsRow}>
        <MetricCard
          title="Total Transactions"
          value={formatNumber(totalCount)}
          subtitle="this session"
          icon={Activity}
          color={theme.colors.primary}
        />
        <MetricCard
          title="Fraud Detected"
          value={formatNumber(fraudCount)}
          subtitle={`${formatPercent(fraudRate)} fraud rate`}
          icon={AlertTriangle}
          color={theme.colors.fraud}
        />
        <MetricCard
          title="Detection Rate"
          value={
            metrics?.performance_metrics?.metrics?.recall
              ? `${(metrics.performance_metrics.metrics.recall * 100).toFixed(1)}%`
              : "82.1%"
          }
          subtitle="fraud caught by model"
          icon={ShieldCheck}
          color={theme.colors.legitimate}
          trend="XGBoost model"
          trendUp={true}
        />
        <MetricCard
          title="Blockchain Records"
          value={formatNumber(chainRecords)}
          subtitle="immutable audit entries"
          icon={Link}
          color={theme.colors.blockchain}
        />
      </div>

      {/* Demo panel */}
      <div style={styles.fullWidth}>
        <DemoPanel onTransactionSent={refresh} />
      </div>

      {/* Transaction table + Investigation Summary for both roles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          alignItems: "start",
        }}
      >
        <TransactionTable
          transactions={transactions}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          user={user}
        />
        <InvestigationSummary />
      </div>

      {/* Charts */}
      <div style={styles.twoCol}>
        <FraudTrendChart transactions={transactions} />
        <FeatureChart />
      </div>
    </div>
  );
};

export default DashboardPage;
