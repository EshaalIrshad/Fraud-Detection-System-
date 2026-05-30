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
      backgroundColor: "#0f172a",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 200,
      borderRight: "1px solid rgba(255,255,255,0.08)",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: `${theme.spacing.lg} ${theme.spacing.md}`,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      marginBottom: theme.spacing.sm,
    },
    logoIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #1a56db, #7c3aed)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: 0,
    },
    logoText: {
      fontSize: "16px",
      fontWeight: 700,
      color: "#ffffff",
      margin: 0,
    },
    logoSub: {
      fontSize: "10px",
      color: "rgba(255,255,255,0.4)",
      margin: 0,
    },
    nav: {
      flex: 1,
      padding: `0 ${theme.spacing.sm}`,
    },
    navLabel: {
      fontSize: "10px",
      fontWeight: 600,
      color: "rgba(255,255,255,0.3)",
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
      backgroundColor: active ? "rgba(26, 86, 219, 0.25)" : "transparent",
      border: active
        ? "1px solid rgba(26, 86, 219, 0.4)"
        : "1px solid transparent",
      color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
    }),
    linkLabel: {
      fontSize: "14px",
      fontWeight: 500,
    },
    userSection: {
      padding: theme.spacing.md,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      marginTop: "auto",
    },
    userCard: {
      backgroundColor: "rgba(255,255,255,0.06)",
      borderRadius: theme.radius.md,
      padding: "10px 12px",
      marginBottom: "8px",
    },
    userName: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#ffffff",
      margin: "0 0 2px 0",
    },
    userRole: {
      fontSize: "11px",
      color: "rgba(255,255,255,0.4)",
      margin: 0,
    },
    roleBadge: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: theme.radius.full,
      fontSize: "10px",
      fontWeight: 600,
      backgroundColor:
        user?.role === "admin"
          ? "rgba(26, 86, 219, 0.3)"
          : "rgba(124, 58, 237, 0.3)",
      color: user?.role === "admin" ? "#93c5fd" : "#c4b5fd",
      marginTop: "4px",
      display: "block",
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
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "transparent",
      color: "rgba(255,255,255,0.5)",
      fontSize: "13px",
      cursor: "pointer",
      transition: theme.transition,
    },
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🛡</div>
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
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
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
            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.15)";
            e.currentTarget.style.color = "#fca5a5";
            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
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
