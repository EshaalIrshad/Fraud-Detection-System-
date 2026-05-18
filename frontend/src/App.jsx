import React, { useState, useEffect } from "react";
import { theme } from "./styles/theme";
import { useTransactions } from "./hooks/useTransactions";
import { useBlockchain } from "./hooks/useBlockchain";
import { useMetaMask } from "./hooks/useMetaMask";
import { useAuth } from "./hooks/useAuth";
import TxExplorer from "./components/blockchain/TxExplorer";
import LoginScreen from "./components/auth/LoginScreen";

// Layout
import Header from "./components/layout/Header";

// Cards
import MetricCard from "./components/cards/MetricCard";

// Charts
import FraudTrendChart from "./components/charts/FraudTrendChart";
import FeatureChart from "./components/charts/FeatureChart";

// Transactions
import TransactionTable from "./components/transactions/TransactionTable";

// Blockchain
import AuditLog from "./components/blockchain/AuditLog";

// Model
import ModelMetrics from "./components/model/ModelMetrics";

// Icons
import { Activity, AlertTriangle, ShieldCheck, Link, Send } from "lucide-react";

// Services
import { checkHealth, predictTransaction } from "./services/api";
import { formatNumber, formatPercent } from "./utils/formatters";

// ============================================================
// Demo Panel — uses real transactions from test dataset
// ============================================================
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

      if (onTransactionSent) onTransactionSent();
    } catch (err) {
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
        Samples a real transaction from your test dataset and runs it through
        the full ML + blockchain pipeline
      </p>

      <div style={styles.infoBox}>
        <span>ℹ</span>
        <span>
          Transactions are randomly sampled from your 56,746-row test set — the
          same data used to evaluate the model in Sprint 2. Results are genuine
          model predictions, not simulated.
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
                Actual label: <strong>{lastTxnInfo.actual}</strong>
                {" · "}
                Test set index: #{lastTxnInfo.index}
                {" · "}
              </>
            )}
            Response time: {lastResult.response_time_ms}ms
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

// ============================================================
// Main App
// ============================================================
export default function App() {
  // ← useAuth is now correctly INSIDE the App component
  const { user, isAuthenticated, login, logout } = useAuth();

  const [apiStatus, setApiStatus] = useState("checking");

  const {
    transactions,
    totalCount,
    fraudCount,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useTransactions(50);

  const { status: blockchainStatus } = useBlockchain();

  const {
    account: walletAccount,
    balance: walletBalance,
    chainId: walletChainId,
    connected: walletConnected,
    connecting: walletConnecting,
    error: walletError,
    txHistory,
    isMetaMaskInstalled,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useMetaMask();

  // Check API health every 15 seconds
  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setApiStatus("online");
      } catch {
        setApiStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  // Derived stats
  const fraudRate = totalCount > 0 ? fraudCount / totalCount : 0;
  const catchRate = 0.821;
  const chainRecords = blockchainStatus?.total_fraud_records || 0;

  const styles = {
    app: {
      backgroundColor: theme.colors.background,
      minHeight: "100vh",
      fontFamily: theme.fonts.family,
    },
    main: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: `${theme.spacing.xl} ${theme.spacing.xl}`,
    },
    metricsRow: {
      display: "flex",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      alignItems: "start",
    },
    threeCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    fullWidth: {
      marginBottom: theme.spacing.lg,
    },
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background:    #e2e8f0;
      border-radius: 3px;
    }
  `;

  // ← Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <>
      <style>{globalCSS}</style>
      <div style={styles.app}>
        {/* Header */}
        <Header
          blockchainStatus={blockchainStatus}
          apiStatus={apiStatus}
          walletConnected={walletConnected}
          walletConnecting={walletConnecting}
          walletAccount={walletAccount}
          walletBalance={walletBalance}
          walletChainId={walletChainId}
          walletError={walletError}
          isMetaMaskInstalled={isMetaMaskInstalled}
          onWalletConnect={connectWallet}
          onWalletDisconnect={disconnectWallet}
          user={user}
          onLogout={logout}
        />

        <main style={styles.main}>
          {/* Row 1 — Metric cards */}
          <div style={styles.metricsRow}>
            <MetricCard
              title="Total Transactions"
              value={formatNumber(totalCount)}
              subtitle="processed this session"
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
              value={formatPercent(catchRate)}
              subtitle="82.1% of fraud caught"
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

          {/* Row 2 — Demo panel */}
          <div style={styles.fullWidth}>
            <DemoPanel onTransactionSent={refresh} />
          </div>

          {/* Row 3 — Transaction table + Model metrics */}
          <div style={styles.twoCol}>
            <TransactionTable
              transactions={transactions}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
              onRefresh={refresh}
            />
            <ModelMetrics />
          </div>

          {/* Row 4 — Charts */}
          <div style={styles.threeCol}>
            <div style={{ gridColumn: "span 2" }}>
              <FraudTrendChart transactions={transactions} />
            </div>
            <FeatureChart />
          </div>

          {/* Row 5 — Live blockchain events (MetaMask) */}
          {walletConnected && (
            <div style={styles.fullWidth}>
              <TxExplorer txHistory={txHistory} account={walletAccount} />
            </div>
          )}

          {/* Row 6 — Blockchain audit log */}
          <div style={styles.fullWidth}>
            <AuditLog />
          </div>
        </main>
      </div>
    </>
  );
}
