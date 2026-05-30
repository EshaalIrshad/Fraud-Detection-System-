import toast from "react-hot-toast";

//AUTH Notifications
export const notifyLoginSuccess = (user) => {
  toast.success(`Login Successful, Hi ${user.name}`, {
    duration: 3000,
    icon: "✅",
    style: {
      background: "#f8fafc",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
  });
};
export const notifyLogout = () => {
  toast("You have been logged out", {
    duration: 2000,
    icon: "✅",
    style: {
      background: "#f8fafc",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
  });
};
export const notifyLoginError = (message) => {
  toast.error(message || "Login failed — please try again", { duration: 4000 });
};

//fraud detection noti
export const notifyFraudDetected = (result) => {
  toast(
    (t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "#dc2626" }}>
          🚨 Fraud Detected
        </div>
        <div style={{ fontSize: "12px", color: "#475569" }}>
          {result.transaction_id}
        </div>
        {result.should_log_to_blockchain && (
          <div style={{ fontSize: "11px", color: "#7c3aed" }}>
            ✓ Logged to blockchain
          </div>
        )}
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            marginTop: "4px",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid #fecaca",
            backgroundColor: "transparent",
            color: "#dc2626",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    ),
    {
      duration: 6000,
      style: {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        padding: "12px 16px",
      },
    },
  );
};

export const notifyLegitimate = (result) => {
  toast.success(`Transaction cleared — ${result.confidence}% confidence`, {
    duration: 2500,
    style: {
      background: "#f0fdf4",
      color: "#16a34a",
      border: "1px solid #bbf7d0",
    },
  });
};
//blockchain noti
export const notifyBlockchainLogged = (result) => {
  toast(
    (t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "#7c3aed" }}>
          ⛓ Logged to Blockchain
        </div>
        <div style={{ fontSize: "12px", color: "#475569" }}>
          Record #{result.record_id}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#7c3aed",
            fontFamily: "monospace",
          }}
        >
          {result.transaction_hash?.slice(0, 20)}...
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          Block #{result.block_number}
        </div>
      </div>
    ),
    {
      duration: 5000,
      icon: "⛓",
      style: {
        background: "#f5f3ff",
        border: "1px solid #ddd6fe",
        padding: "12px 16px",
      },
    },
  );
};

export const notifyBlockchainConnected = () => {
  toast.success("Blockchain connected — Chain ID 31337", {
    duration: 3000,
    icon: "⛓",
    style: {
      background: "#f5f3ff",
      color: "#7c3aed",
      border: "1px solid #ddd6fe",
    },
  });
};

export const notifyBlockchainOffline = () => {
  toast.error("Blockchain offline — start Hardhat node", {
    duration: 5000,
    icon: "⛓",
  });
};

// SYSTEM notifications

export const notifyApiOnline = () => {
  toast.success("API connected — Flask server online", {
    duration: 2500,
    icon: "🟢",
  });
};

export const notifyApiOffline = () => {
  toast.error("API offline — start Flask server", {
    duration: 6000,
    icon: "🔴",
  });
};

export const notifyCopied = (text) => {
  toast.success(text || "Copied to clipboard", {
    duration: 1500,
    icon: "📋",
  });
};

// PROMISE toast — shows loading then success or error
// Use this for async operations like sending transactions

export const notifyPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || "Processing...",
      success: messages.success || "Done!",
      error: messages.error || "Something went wrong",
    },
    {
      style: {
        minWidth: "250px",
      },
      success: {
        duration: 3000,
      },
      error: {
        duration: 5000,
      },
    },
  );
};
