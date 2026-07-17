import React, { useState } from "react";
import { theme } from "../../styles/theme";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./TransactionModal";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { timeAgo } from "../../utils/formatters";

const PAGE_SIZE = 7;

const TransactionTable = ({
  transactions,
  loading,
  error,
  lastUpdated,
  onRefresh,
  user,
}) => {
  const [selectedTx, setSelectedTx] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = transactions.filter((tx) => {
    if (filter === "fraud") return tx.prediction === "FRAUD";
    if (filter === "legitimate") return tx.prediction === "LEGITIMATE";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Reset to page 1 when filter changes
  const handleFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
      overflow: "hidden",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
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
    controls: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    filterBtn: (active) => ({
      padding: "4px 12px",
      borderRadius: theme.radius.full,
      border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
      backgroundColor: active ? theme.colors.primaryLight : "transparent",
      color: active ? theme.colors.primary : theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.sm,
      cursor: "pointer",
      fontWeight: active
        ? theme.fonts.weights.medium
        : theme.fonts.weights.normal,
      transition: theme.transition,
    }),
    refreshBtn: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 12px",
      borderRadius: theme.radius.full,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: "transparent",
      color: theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.sm,
      cursor: "pointer",
      transition: theme.transition,
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 120px 100px 120px 140px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      backgroundColor: theme.colors.background,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    tableHeaderCell: {
      padding: "0 8px",
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xxl,
      color: theme.colors.textMuted,
      fontSize: theme.fonts.sizes.md,
    },
    liveIndicator: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.legitimate,
    },
    liveDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: theme.colors.legitimate,
      animation: "pulse 2s infinite",
    },
    pagination: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      borderTop: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.background,
    },
    pageInfo: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
    },
    pageControls: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    pageBtn: (active, disabled) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "30px",
      height: "30px",
      borderRadius: theme.radius.md,
      border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
      backgroundColor: active ? theme.colors.primary : "transparent",
      color: active
        ? "#ffffff"
        : disabled
          ? theme.colors.textMuted
          : theme.colors.textSecondary,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: active
        ? theme.fonts.weights.semibold
        : theme.fonts.weights.normal,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: theme.transition,
    }),
  };

  // Build page number array with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (safePage > 3) pages.push("...");
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.title}>Live Transaction Feed</p>
            <p style={styles.subtitle}>
              {lastUpdated
                ? `Updated ${timeAgo(lastUpdated)}`
                : "Waiting for data..."}
            </p>
          </div>

          <div style={styles.controls}>
            {/* Live indicator */}
            <div style={styles.liveIndicator}>
              <div style={styles.liveDot} />
              <span>Live</span>
            </div>

            {/* Filter buttons */}
            {["all", "fraud", "legitimate"].map((f) => (
              <button
                key={f}
                style={styles.filterBtn(filter === f)}
                onClick={() => handleFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}

            {/* Refresh button */}
            <button style={styles.refreshBtn} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table header */}
        <div style={styles.tableHeader}>
          {[
            "Transaction ID",
            "Time",
            "Prediction",
            "Fraud %",
            "Response",
            "Blockchain",
          ].map((h) => (
            <div key={h} style={styles.tableHeaderCell}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={styles.emptyState}>Loading transactions...</div>
        ) : error ? (
          <div style={{ ...styles.emptyState, color: theme.colors.fraud }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            No transactions yet — send a prediction to see results here
          </div>
        ) : (
          paginated.map((tx, i) => (
            <TransactionRow
              key={tx.transaction_id}
              transaction={tx}
              onClick={setSelectedTx}
              index={i}
            />
          ))
        )}

        {/* Pagination */}
        {!loading && !error && filtered.length > PAGE_SIZE && (
          <div style={styles.pagination}>
            <span style={styles.pageInfo}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} transactions
            </span>

            <div style={styles.pageControls}>
              {/* Prev */}
              <button
                style={styles.pageBtn(false, safePage === 1)}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    style={{
                      width: "30px",
                      textAlign: "center",
                      fontSize: theme.fonts.sizes.sm,
                      color: theme.colors.textMuted,
                    }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    style={styles.pageBtn(p === safePage, false)}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                style={styles.pageBtn(false, safePage === totalPages)}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedTx && (
        <TransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          user={user}
        />
      )}
    </>
  );
};

export default TransactionTable;
