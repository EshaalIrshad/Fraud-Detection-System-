import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { theme } from "../../styles/theme";
import {
  createAnalyst,
  getUsers,
  toggleUser,
  adminResetPassword,
  getPasswordRequests,
  resolvePasswordRequest,
} from "../../services/authApi";
import toast from "react-hot-toast";
import { UserPlus, RefreshCw, Check, X, Users, Key } from "lucide-react";
import { formatTimestamp } from "../../utils/formatters";

// Create Analyst Modal
const CreateAnalystModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createAnalyst({
        username: form.username.toLowerCase(),
        name: form.name,
        password: form.password,
      });
      toast.success(`Analyst account created for ${form.name}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create analyst");
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    width: "460px",
    boxShadow: theme.shadows.lg,
    border: `1px solid ${theme.colors.border}`,
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
  };

  const labelStyle = {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.textSecondary,
    display: "block",
    marginTop: theme.spacing.md,
  };

  const btnStyle = (primary) => ({
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.radius.md,
    border: primary ? "none" : `1px solid ${theme.colors.border}`,
    backgroundColor: primary ? theme.colors.primary : "transparent",
    color: primary ? theme.colors.textWhite : theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.medium,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.lg,
          }}
        >
          <div>
            <p
              style={{
                fontSize: theme.fonts.sizes.xl,
                fontWeight: theme.fonts.weights.semibold,
                color: theme.colors.textPrimary,
                margin: 0,
              }}
            >
              Create Analyst Account
            </p>
            <p
              style={{
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textMuted,
                margin: "4px 0 0 0",
              }}
            >
              New analyst will login with these credentials
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.colors.textMuted,
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Full Name</label>
          <input
            style={inputStyle}
            placeholder="e.g. Sarah Johnson"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label style={labelStyle}>Username</label>
          <input
            style={inputStyle}
            placeholder="e.g. sarah.johnson"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
            required
          />

          <label style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

          <label style={labelStyle}>Confirm Password</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="Re-enter password"
            value={form.confirm}
            onChange={(e) =>
              setForm({
                ...form,
                confirm: e.target.value,
              })
            }
            required
          />

          {error && (
            <div
              style={{
                marginTop: theme.spacing.md,
                padding: "10px 14px",
                backgroundColor: theme.colors.fraudLight,
                border: `1px solid ${theme.colors.fraudBorder}`,
                borderRadius: theme.radius.md,
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.fraud,
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing.sm,
              marginTop: theme.spacing.lg,
            }}
          >
            <button type="button" style={btnStyle(false)} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={btnStyle(true)} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reset Password Modal
const ResetPasswordModal = ({ analyst, onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
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
      await adminResetPassword(analyst.id, newPassword);
      toast.success(`Password reset for ${analyst.name}`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    width: "420px",
    boxShadow: theme.shadows.lg,
    border: `1px solid ${theme.colors.border}`,
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
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.lg,
          }}
        >
          <div>
            <p
              style={{
                fontSize: theme.fonts.sizes.xl,
                fontWeight: theme.fonts.weights.semibold,
                color: theme.colors.textPrimary,
                margin: 0,
              }}
            >
              Reset Password
            </p>
            <p
              style={{
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textMuted,
                margin: "4px 0 0 0",
              }}
            >
              Resetting password for {analyst.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.colors.textMuted,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleReset}>
          <label
            style={{
              fontSize: theme.fonts.sizes.sm,
              fontWeight: theme.fonts.weights.medium,
              color: theme.colors.textSecondary,
              display: "block",
            }}
          >
            New Password
          </label>
          <input
            style={inputStyle}
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label
            style={{
              fontSize: theme.fonts.sizes.sm,
              fontWeight: theme.fonts.weights.medium,
              color: theme.colors.textSecondary,
              display: "block",
              marginTop: theme.spacing.md,
            }}
          >
            Confirm Password
          </label>
          <input
            style={inputStyle}
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && (
            <div
              style={{
                marginTop: theme.spacing.md,
                padding: "10px 14px",
                backgroundColor: theme.colors.fraudLight,
                border: `1px solid ${theme.colors.fraudBorder}`,
                borderRadius: theme.radius.md,
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.fraud,
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing.sm,
              marginTop: theme.spacing.lg,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: "transparent",
                color: theme.colors.textSecondary,
                cursor: "pointer",
                fontSize: theme.fonts.sizes.md,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                borderRadius: theme.radius.md,
                border: "none",
                backgroundColor: theme.colors.primary,
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: theme.fonts.sizes.md,
                fontWeight: theme.fonts.weights.medium,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Password Requests Panel
const PasswordRequestsPanel = () => {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["password-requests", "pending"],
    queryFn: () => getPasswordRequests("pending"),
    refetchInterval: 15000,
  });

  const requests = data?.requests || [];

  const handleResolve = async (requestId, action) => {
    try {
      await resolvePasswordRequest(
        requestId,
        action,
        action === "reject" ? rejectReason : "",
      );
      toast.success(`Password request ${action}d successfully`);
      setRejectingId(null);
      setRejectReason("");
      queryClient.invalidateQueries(["password-requests"]);
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} request`);
    }
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      overflow: "hidden",
      marginTop: theme.spacing.lg,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.warningLight,
    },
    title: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.warning,
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    badge: {
      backgroundColor: theme.colors.warning,
      color: "#ffffff",
      borderRadius: theme.radius.full,
      padding: "2px 10px",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.semibold,
    },
    requestRow: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    analystName: {
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textPrimary,
      margin: "0 0 2px 0",
    },
    requestMeta: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: "0 0 8px 0",
    },
    reason: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.background,
      padding: "6px 10px",
      borderRadius: theme.radius.sm,
      marginBottom: "10px",
    },
    actionRow: {
      display: "flex",
      gap: theme.spacing.sm,
    },
    approveBtn: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 14px",
      borderRadius: theme.radius.md,
      border: "none",
      backgroundColor: theme.colors.legitimate,
      color: "#ffffff",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      cursor: "pointer",
    },
    rejectBtn: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 14px",
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.fraud}`,
      backgroundColor: "transparent",
      color: theme.colors.fraud,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      cursor: "pointer",
    },
    rejectInput: {
      width: "100%",
      padding: "8px 12px",
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.fraudBorder}`,
      fontSize: theme.fonts.sizes.sm,
      fontFamily: theme.fonts.family,
      outline: "none",
      marginTop: "8px",
      backgroundColor: theme.colors.fraudLight,
    },
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xl,
      color: theme.colors.textMuted,
      fontSize: theme.fonts.sizes.md,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.title}>
          <Key size={18} />
          Password Change Requests
        </p>
        <span style={styles.badge}>{requests.length} pending</span>
      </div>

      {isLoading ? (
        <div style={styles.emptyState}>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div style={styles.emptyState}>✓ No pending password requests</div>
      ) : (
        requests.map((req) => (
          <div key={req.id} style={styles.requestRow}>
            <p style={styles.analystName}>{req.analyst_name}</p>
            <p style={styles.requestMeta}>
              @{req.analyst_username} · Requested{" "}
              {formatTimestamp(req.requested_at)}
            </p>

            {req.reason && (
              <div style={styles.reason}>Reason: {req.reason}</div>
            )}

            {rejectingId === req.id ? (
              <div>
                <input
                  style={styles.rejectInput}
                  placeholder="Reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div
                  style={{
                    ...styles.actionRow,
                    marginTop: "8px",
                  }}
                >
                  <button
                    style={styles.rejectBtn}
                    onClick={() => handleResolve(req.id, "reject")}
                  >
                    <X size={14} />
                    Confirm Reject
                  </button>
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: theme.radius.md,
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: "transparent",
                      color: theme.colors.textMuted,
                      fontSize: theme.fonts.sizes.sm,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setRejectingId(null);
                      setRejectReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.actionRow}>
                <button
                  style={styles.approveBtn}
                  onClick={() => handleResolve(req.id, "approve")}
                >
                  <Check size={14} />
                  Approve
                </button>
                <button
                  style={styles.rejectBtn}
                  onClick={() => setRejectingId(req.id)}
                >
                  <X size={14} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Main UserManagement Component
const UserManagement = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [resetAnalyst, setResetAnalyst] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    refetchInterval: 30000,
  });

  const users = data?.users || [];

  const handleToggle = async (userId, currentStatus) => {
    try {
      await toggleUser(userId);
      toast.success(`Account ${currentStatus ? "deactivated" : "activated"}`);
      queryClient.invalidateQueries(["users"]);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update account");
    }
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
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    createBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.radius.md,
      border: "none",
      backgroundColor: theme.colors.primary,
      color: "#ffffff",
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      cursor: "pointer",
    },
    userRow: {
      display: "grid",
      gridTemplateColumns: "1fr 120px 120px 100px",
      alignItems: "center",
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "1fr 120px 120px 100px",
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      backgroundColor: theme.colors.background,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    headerCell: {
      fontSize: theme.fonts.sizes.xs,
      fontWeight: theme.fonts.weights.semibold,
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    userName: {
      fontSize: theme.fonts.sizes.md,
      fontWeight: theme.fonts.weights.medium,
      color: theme.colors.textPrimary,
      margin: "0 0 2px 0",
    },
    userMeta: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textMuted,
      margin: 0,
    },
    statusBadge: (active) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "3px 10px",
      borderRadius: theme.radius.full,
      fontSize: theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      backgroundColor: active
        ? theme.colors.legitimateLight
        : theme.colors.fraudLight,
      color: active ? theme.colors.legitimate : theme.colors.fraud,
    }),
    actionBtn: (color) => ({
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 10px",
      borderRadius: theme.radius.md,
      border: `1px solid ${color}30`,
      backgroundColor: `${color}10`,
      color: color,
      fontSize: theme.fonts.sizes.xs,
      cursor: "pointer",
      fontWeight: theme.fonts.weights.medium,
    }),
    emptyState: {
      textAlign: "center",
      padding: theme.spacing.xl,
      color: theme.colors.textMuted,
    },
  };

  return (
    <div>
      {/* Users Table */}
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.title}>
            <Users size={18} />
            Analyst Accounts
            <span
              style={{
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textMuted,
                fontWeight: theme.fonts.weights.normal,
                backgroundColor: theme.colors.background,
                padding: "2px 8px",
                borderRadius: theme.radius.full,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              {users.length} total
            </span>
          </p>
          <button style={styles.createBtn} onClick={() => setShowCreate(true)}>
            <UserPlus size={14} />
            Add Analyst
          </button>
        </div>

        {/* Table header */}
        <div style={styles.tableHeader}>
          {["Analyst", "Created", "Status", "Actions"].map((h) => (
            <span key={h} style={styles.headerCell}>
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div style={styles.emptyState}>Loading analysts...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyState}>
            No analyst accounts yet — click Add Analyst to create one
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} style={styles.userRow}>
              {/* Name and username */}
              <div>
                <p style={styles.userName}>{user.name}</p>
                <p style={styles.userMeta}>@{user.username}</p>
              </div>

              {/* Created date */}
              <span
                style={{
                  fontSize: theme.fonts.sizes.sm,
                  color: theme.colors.textMuted,
                }}
              >
                {new Date(user.created_at).toLocaleDateString("en-GB")}
              </span>

              {/* Status badge */}
              <span style={styles.statusBadge(user.is_active)}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: user.is_active
                      ? theme.colors.legitimate
                      : theme.colors.fraud,
                    display: "inline-block",
                  }}
                />
                {user.is_active ? "Active" : "Inactive"}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  style={styles.actionBtn(theme.colors.primary)}
                  onClick={() => setResetAnalyst(user)}
                  title="Reset password"
                >
                  <Key size={12} />
                  Reset
                </button>
                <button
                  style={styles.actionBtn(
                    user.is_active
                      ? theme.colors.fraud
                      : theme.colors.legitimate,
                  )}
                  onClick={() => handleToggle(user.id, user.is_active)}
                >
                  {user.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Password Requests Panel */}
      <PasswordRequestsPanel />

      {/* Modals */}
      {showCreate && (
        <CreateAnalystModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => queryClient.invalidateQueries(["users"])}
        />
      )}

      {resetAnalyst && (
        <ResetPasswordModal
          analyst={resetAnalyst}
          onClose={() => setResetAnalyst(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
