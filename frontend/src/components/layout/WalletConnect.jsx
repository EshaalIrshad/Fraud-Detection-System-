import React from "react";
import { theme } from "../../styles/theme";
import { Wallet, LogOut } from "lucide-react";
import { shortenAddress } from "../../utils/formatters";

const WalletConnect = ({
  connected,
  connecting,
  account,
  balance,
  error,
  onConnect,
  onDisconnect,
  isMetaMaskInstalled,
}) => {
  if (!isMetaMaskInstalled) {
    return (
      <div>
        <button
          onClick={() => window.open("https://metamask.io/download/", "_blank")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "999px",
            border: `1px solid ${theme.colors.primary}`,
            backgroundColor: theme.colors.primaryLight,
            color: theme.colors.primary,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Install MetaMask
        </button>
      </div>
    );
  }

  if (connected && account) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "11px",
            color: theme.colors.blockchain,
            backgroundColor: theme.colors.blockchainLight,
            padding: "2px 6px",
            borderRadius: "999px",
            border: `1px solid ${theme.colors.blockchain}30`,
          }}
        >
          Hardhat Local
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            borderRadius: "999px",
            border: `1px solid ${theme.colors.legitimateBorder}`,
            backgroundColor: theme.colors.legitimateLight,
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: theme.colors.legitimate,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: theme.colors.legitimate,
              fontFamily: "monospace",
            }}
          >
            {shortenAddress(account)}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: theme.colors.textMuted,
            }}
          >
            {balance} ETH
          </span>
        </div>
        <button
          onClick={onDisconnect}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: "6px",
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: "transparent",
            color: theme.colors.textMuted,
            cursor: "pointer",
          }}
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {error && (
        <span
          style={{
            fontSize: "11px",
            color: theme.colors.fraud,
            maxWidth: "200px",
          }}
        >
          {error}
        </span>
      )}
      <button
        onClick={onConnect}
        disabled={connecting}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          borderRadius: "999px",
          border: `1px solid ${theme.colors.primary}`,
          backgroundColor: theme.colors.primaryLight,
          color: theme.colors.primary,
          fontSize: "12px",
          fontWeight: 500,
          cursor: connecting ? "not-allowed" : "pointer",
          opacity: connecting ? 0.7 : 1,
        }}
      >
        <Wallet size={14} />
        {connecting ? "Connecting..." : "Connect MetaMask"}
      </button>
    </div>
  );
};

export default WalletConnect;
