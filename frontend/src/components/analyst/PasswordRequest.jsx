import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { theme } from "../../styles/theme";
import {
  submitPasswordRequest,
  getMyPasswordRequest,
} from "../../services/authApi";
import toast from "react-hot-toast";
import { Key, Clock, Check, X } from "lucide-react";
import { formatTimestamp } from "../../utils/formatters";

const PasswordRequest = ({ user }) => {
  const queryClient = useQueryClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-password-request"],
    queryFn: getMyPasswordRequest,
    refetchInterval: 15000,
  });

  const myRequest = data?.request;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await submitPasswordRequest(newPassword, reason);
      toast.success(
        "Password change request submitted — awaiting admin approval",
      );
      setShowForm(false);
      setNewPassword("");
      setConfirm("");
      setReason("");
      queryClient.invalidateQueries(["my-password-request"]);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit request";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.family,
    outline: "none",
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    marginTop: "6px",
    marginBottom: theme.spacing.sm,
  };

  const labelStyle = {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.textSecondary,
    display: "block",
    marginTop: theme.spacing.sm,
  };

  const getStatusStyle = (status) => {
    if (status === "pending")
      return {
        bg: theme.colors.warningLight,
        color: theme.colors.warning,
        icon: <Clock size={14} />,
        text: "Pending admin approval",
      };
    if (status === "approved")
      return {
        bg: theme.colors.legitimateLight,
        color: theme.colors.legitimate,
        icon: <Check size={14} />,
        text: "Approved — you can now login with your new password",
      };
    if (status === "rejected")
      return {
        bg: theme.colors.fraudLight,
        color: theme.colors.fraud,
        icon: <X size={14} />,
        text: "Rejected by admin",
      };
    return {};
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      overflow: "hidden",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: 0,
    },
    body: {
      padding: theme.spacing.lg,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Key size={18} color={theme.colors.primary} />
        <p style={styles.title}>Password Management</p>
      </div>

      <div style={styles.body}>
        {/* Current request status */}
        {isLoading ? (
          <p
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.fonts.sizes.sm,
            }}
          >
            Checking request status...
          </p>
        ) : myRequest ? (
          <div>
            {(() => {
              const statusInfo = getStatusStyle(myRequest.status);
              return (
                <div
                  style={{
                    backgroundColor: statusInfo.bg,
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: statusInfo.color,
                      fontWeight: theme.fonts.weights.semibold,
                      fontSize: theme.fonts.sizes.md,
                      marginBottom: "6px",
                    }}
                  >
                    {statusInfo.icon}
                    {statusInfo.text}
                  </div>
                  <div
                    style={{
                      fontSize: theme.fonts.sizes.sm,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Requested: {formatTimestamp(myRequest.requested_at)}
                    {myRequest.resolved_at && (
                      <> · Resolved: {formatTimestamp(myRequest.resolved_at)}</>
                    )}
                  </div>
                  {myRequest.reject_reason && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: theme.fonts.sizes.sm,
                        color: theme.colors.fraud,
                      }}
                    >
                      Reason: {myRequest.reject_reason}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Allow new request if previous was resolved */}
            {myRequest.status !== "pending" && (
              <button
                onClick={() => setShowForm(!showForm)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.colors.primary}`,
                  backgroundColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                  fontSize: theme.fonts.sizes.sm,
                  fontWeight: theme.fonts.weights.medium,
                  cursor: "pointer",
                  marginBottom: showForm ? theme.spacing.md : 0,
                }}
              >
                <Key size={14} />
                Submit New Request
              </button>
            )}
          </div>
        ) : (
          <div>
            <p
              style={{
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.md,
              }}
            >
              You can request a password change below. Your request will be
              reviewed and approved by the system administrator.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.primary}`,
                backgroundColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                fontSize: theme.fonts.sizes.sm,
                fontWeight: theme.fonts.weights.medium,
                cursor: "pointer",
                marginBottom: showForm ? theme.spacing.md : 0,
              }}
            >
              <Key size={14} />
              Request Password Change
            </button>
          </div>
        )}

        {/* Request form */}
        {showForm && (
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>New Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label style={labelStyle}>Confirm Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <label style={labelStyle}>Reason (optional)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Regular security update"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: theme.colors.fraudLight,
                  border: `1px solid ${theme.colors.fraudBorder}`,
                  borderRadius: theme.radius.md,
                  fontSize: theme.fonts.sizes.sm,
                  color: theme.colors.fraud,
                  marginBottom: theme.spacing.sm,
                }}
              >
                ⚠ {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.sm,
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  borderRadius: theme.radius.md,
                  border: "none",
                  backgroundColor: theme.colors.primary,
                  color: "#ffffff",
                  fontSize: theme.fonts.sizes.md,
                  fontWeight: theme.fonts.weights.medium,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                  setNewPassword("");
                  setConfirm("");
                  setReason("");
                }}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: "transparent",
                  color: theme.colors.textSecondary,
                  fontSize: theme.fonts.sizes.md,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordRequest;
