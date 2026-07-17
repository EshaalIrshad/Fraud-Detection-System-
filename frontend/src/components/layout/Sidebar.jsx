import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { theme } from "../../styles/theme";
import {
  LayoutDashboard,
  Link,
  Users,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminLinks = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/blockchain",
      icon: Link,
      label: "Blockchain",
    },
    {
      path: "/admin",
      icon: Users,
      label: "User Management",
    },
  ];

  const analystLinks = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const links = user?.role === "admin" ? adminLinks : analystLinks;

  const styles = {
    sidebar: {
      width: "220px",
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 200,
      borderRight: "1px solid #e2e8f0",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: `${theme.spacing.lg} ${theme.spacing.md}`,
      borderBottom: "1px solid #e2e8f0",
      marginBottom: theme.spacing.sm,
    },
    logoIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: "#1a56db",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: 0,
    },
    logoText: {
      fontSize: "16px",
      fontWeight: 700,
      color: "#0f172a",
      margin: 0,
    },
    logoSub: {
      fontSize: "10px",
      color: "#94a3b8",
      margin: 0,
    },
    nav: {
      flex: 1,
      padding: `0 ${theme.spacing.sm}`,
    },
    navLabel: {
      fontSize: "10px",
      fontWeight: 600,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
      marginTop: theme.spacing.sm,
    },
    link: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 12px",
      borderRadius: theme.radius.md,
      marginBottom: "2px",
      cursor: "pointer",
      transition: theme.transition,
      backgroundColor: active ? "#e8f0fe" : "transparent",
      border: "none",
      color: active ? "#1a56db" : "#64748b",
    }),
    linkLabel: {
      fontSize: "14px",
      fontWeight: (active) => (active ? 600 : 400),
    },
    userSection: {
      padding: theme.spacing.md,
      borderTop: "1px solid #e2e8f0",
      marginTop: "auto",
    },
    userCard: {
      backgroundColor: "#f8fafc",
      borderRadius: theme.radius.md,
      padding: "10px 12px",
      marginBottom: "8px",
      border: "1px solid #e2e8f0",
    },
    userName: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#0f172a",
      margin: "0 0 2px 0",
    },
    userRole: {
      fontSize: "11px",
      color: "#94a3b8",
      margin: 0,
    },
    roleBadge: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: theme.radius.full,
      fontSize: "10px",
      fontWeight: 600,
      backgroundColor: user?.role === "admin" ? "#e8f0fe" : "#f5f3ff",
      color: user?.role === "admin" ? "#1a56db" : "#7c3aed",
      marginTop: "4px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      padding: "8px 12px",
      borderRadius: theme.radius.md,
      border: "1px solid #e2e8f0",
      backgroundColor: "transparent",
      color: "#515d6f",
      fontSize: "13px",
      cursor: "pointer",
      transition: theme.transition,
    },
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Shield size={20} color="#ffffff" />
        </div>
        <div>
          <p style={styles.logoText}>FraudShield</p>
          <p style={styles.logoSub}>Fraud Detection</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>Navigation</p>
        {links.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <div
              key={path}
              style={styles.link(active)}
              onClick={() => navigate(path)}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#1a56db";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              <Icon size={18} />
              <span style={styles.linkLabel}>{label}</span>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div style={styles.userSection}>
        <div style={styles.userCard}>
          <p style={styles.userName}>{user?.name}</p>
          <p style={styles.userRole}>@{user?.username}</p>
          <span style={styles.roleBadge}>{user?.role}</span>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={onLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
            e.currentTarget.style.color = "#dc2626";
            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#515d6f";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
