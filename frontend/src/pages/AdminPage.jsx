import React from "react";
import { theme } from "../styles/theme";
import UserManagement from "../components/admin/UserManagement";
import { Users } from "lucide-react";

const AdminPage = () => {
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
  };

  return (
    <div style={styles.page}>
      <p style={styles.pageTitle}>User Management</p>
      <p style={styles.pageSubtitle}>
        Manage analyst accounts and password requests
      </p>
      <UserManagement />
    </div>
  );
};

export default AdminPage;
