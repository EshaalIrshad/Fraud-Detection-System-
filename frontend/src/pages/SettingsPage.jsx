import React from "react";
import { theme } from "../styles/theme";
import PasswordRequest from "../components/analyst/PasswordRequest";

const SettingsPage = ({ user }) => {
  const styles = {
    page: {
      padding: theme.spacing.xl,
      maxWidth: "600px",
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
  };

  return (
    <div style={styles.page}>
      <p style={styles.pageTitle}>Settings</p>
      <p style={styles.pageSubtitle}>Manage your account preferences</p>
      <PasswordRequest user={user} />
    </div>
  );
};

export default SettingsPage;
