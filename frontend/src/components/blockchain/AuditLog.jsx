import React, { useState } from "react";
import { theme } from "../../styles/theme";
import { useQuery } from "@tanstack/react-query";
import { getBlockchainStatus, getBlockchainRecord } from "../../services/api";
import BlockchainBadge from "../cards/BlockchainBadge";
import {
  shortenHash,
  formatTimestamp,
  formatSHAP,
} from "../../utils/formatters";
import { ChevronDown, ChevronUp, Link } from "lucide-react";

const AuditLog = () => {
  const [expandedRecord, setExpandedRecord] = useState(null);

  // Get blockchain status to know total records
  const { data: chainStatus } = useQuery({
    queryKey: ["blockchain-status"],
    queryFn: getBlockchainStatus,
    refetchInterval: 10000,
  });

  const totalRecords = chainStatus?.total_fraud_records || 0;

  // Fetch last 5 records
  const recordIds = Array.from(
    { length: Math.min(totalRecords, 5) },
    (_, i) => totalRecords - i,
  ).filter((id) => id > 0);

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
      backgroundColor: theme.colors.blockchainLight,
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.blockchain,
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    subtitle: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.blockchain,
      opacity: 0.7,
      margin: "2px 0 0 0",
    },
    countBadge: {
      backgroundColor: theme.colors.blockchain,
      color: theme.colors.textWhite,
      borderRadius: theme.radius.full,
      padding: "2px 10px",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
    },
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xxl,
      color: theme.colors.textMuted,
    },
    emptyIcon: {
      fontSize: "32px",
      marginBottom: theme.spacing.sm,
    },
    record: {
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    recordHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      cursor: "pointer",
      transition: theme.transition,
    },
    recordId: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.blockchain,
    },
    recordTxId: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textSecondary,
      fontFamily: "monospace",
    },
    expandedContent: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg} ${theme.spacing.md}`,
      backgroundColor: theme.colors.blockchainLight,
      borderTop: `1px solid ${theme.colors.border}`,
    },
    detailRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "6px",
    },
    detailLabel: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
    },
    detailValue: {
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textPrimary,
      fontFamily: "monospace",
    },
    featureChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      backgroundColor: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.sm,
      padding: "2px 8px",
      fontSize: theme.fonts.sizes.xs,
      marginRight: "6px",
      marginTop: "4px",
      fontFamily: "monospace",
    },
  };

  // Individual record component
  const RecordItem = ({ recordId }) => {
    const { data: record, isLoading } = useQuery({
      queryKey: ["blockchain-record", recordId],
      queryFn: () => getBlockchainRecord(recordId),
      staleTime: Infinity, // blockchain records never change
    });

    const isExpanded = expandedRecord === recordId;

    if (isLoading) {
      return (
        <div style={{ padding: theme.spacing.md, textAlign: "center" }}>
          <span
            style={{
              fontSize: theme.fonts.sizes.sm,
              color: theme.colors.textMuted,
            }}
          >
            Loading record #{recordId}...
          </span>
        </div>
      );
    }

    if (!record || record.error) return null;

    return (
      <div style={styles.record}>
        <div
          style={styles.recordHeader}
          onClick={() => setExpandedRecord(isExpanded ? null : recordId)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div>
            <p style={styles.recordId}>Record #{record.record_id}</p>
            <p style={styles.recordTxId}>{record.transaction_id}</p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <span
              style={{
                fontSize: theme.fonts.sizes.sm,
                fontWeight: theme.fonts.weights.semibold,
                color: theme.colors.fraud,
              }}
            >
              {record.confidence?.toFixed(2)}% confidence
            </span>
            {isExpanded ? (
              <ChevronUp size={16} color={theme.colors.textMuted} />
            ) : (
              <ChevronDown size={16} color={theme.colors.textMuted} />
            )}
          </div>
        </div>

        {isExpanded && (
          <div style={styles.expandedContent}>
            {/* Details */}
            {[
              ["Record ID", `#${record.record_id}`],
              ["Transaction", record.transaction_id],
              [
                "Timestamp",
                formatTimestamp(
                  new Date(record.timestamp * 1000).toISOString(),
                ),
              ],
              ["Confidence", `${record.confidence?.toFixed(2)}%`],
              ["Model", record.model_version],
            ].map(([label, value]) => (
              <div key={label} style={styles.detailRow}>
                <span style={styles.detailLabel}>{label}</span>
                <span style={styles.detailValue}>{value}</span>
              </div>
            ))}

            {/* SHAP features */}
            <p
              style={{
                fontSize: theme.fonts.sizes.xs,
                color: theme.colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: "8px 0 4px 0",
              }}
            >
              Top features logged
            </p>
            <div>
              {record.features?.map((f, i) => (
                <span key={i} style={styles.featureChip}>
                  <span
                    style={{
                      color:
                        f.direction === "FRAUD"
                          ? theme.colors.fraud
                          : theme.colors.legitimate,
                      fontWeight: theme.fonts.weights.semibold,
                    }}
                  >
                    {f.name}
                  </span>
                  <span style={{ color: theme.colors.textMuted }}>
                    {formatSHAP(f.shap_value)}
                  </span>
                </span>
              ))}
            </div>

            {/* Blockchain badge */}
            <div style={{ marginTop: theme.spacing.sm }}>
              <BlockchainBadge recordId={record.record_id} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.title}>
            <Link size={18} />
            Blockchain Audit Log
          </p>
          <p style={styles.subtitle}>
            Immutable fraud records — cannot be altered or deleted
          </p>
        </div>
        <span style={styles.countBadge}>{totalRecords} records on-chain</span>
      </div>

      {/* Records */}
      {totalRecords === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>⛓️</div>
          <p style={{ margin: 0, fontWeight: theme.fonts.weights.medium }}>
            No fraud records on blockchain yet
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: theme.fonts.sizes.sm,
            }}
          >
            Records appear here when fraud is detected and logged
          </p>
        </div>
      ) : (
        recordIds.map((id) => <RecordItem key={id} recordId={id} />)
      )}
    </div>
  );
};

export default AuditLog;
