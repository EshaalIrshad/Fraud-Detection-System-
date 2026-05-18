// Central theme file — all colours, fonts, spacing in one place
// Change anything here and it updates across the entire app

export const theme = {
  colors: {
    // Primary palette — white and blue as requested
    primary: "#1a56db", // main blue
    primaryLight: "#e8f0fe", // light blue background
    primaryDark: "#1e40af", // dark blue for hover

    // Background
    background: "#f8fafc", // page background (off white)
    surface: "#ffffff", // card background (pure white)
    surfaceHover: "#f1f5f9", // card hover state

    // Status colours
    fraud: "#dc2626", // red for fraud
    fraudLight: "#fef2f2", // light red background
    fraudBorder: "#fecaca", // red border

    legitimate: "#16a34a", // green for legitimate
    legitimateLight: "#f0fdf4", // light green background
    legitimateBorder: "#bbf7d0", // green border

    blockchain: "#7c3aed", // purple for blockchain verified
    blockchainLight: "#f5f3ff", // light purple background

    warning: "#d97706", // amber for warnings
    warningLight: "#fffbeb", // light amber background

    // Text
    textPrimary: "#0f172a", // near black — headings
    textSecondary: "#475569", // dark grey — body text
    textMuted: "#94a3b8", // light grey — labels, hints
    textWhite: "#ffffff", // white text on dark backgrounds

    // Borders
    border: "#e2e8f0", // default border
    borderFocus: "#1a56db", // focused input border
  },

  // Typography
  fonts: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    sizes: {
      xs: "11px",
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "20px",
      xxl: "24px",
      xxxl: "32px",
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },

  // Border radius
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.08)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 8px 24px rgba(0,0,0,0.10)",
  },

  // Transitions
  transition: "all 0.2s ease",
};

// Semantic shortcuts used across components
export const colors = theme.colors;
export const fonts = theme.fonts;
export const space = theme.spacing;
