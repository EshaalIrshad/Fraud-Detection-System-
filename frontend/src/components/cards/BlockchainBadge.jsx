import React from "react";
import { theme } from "../../styles/theme";
import { shortenHash } from "../../utils/formatters";

// Shows a "Verified on Blockchain" badge
// Used in transaction rows and modal when fraud is logged
// Props:
//   txHash    — blockchain transaction hash
//   recordId  — fraud record ID on chain
//   small     — smaller version for table rows

const BlockchainBadge = ({ txHash, recordId, small = false }) => {
  const styles = {
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      backgroundColor: theme.colors.blockchainLight,
      color: theme.colors.blockchain,
      border: `1px solid ${theme.colors.blockchain}30`,
      borderRadius: theme.radius.full,
      padding: small ? "2px 8px" : "4px 12px",
      fontSize: small ? theme.fonts.sizes.xs : theme.fonts.sizes.sm,
      fontWeight: theme.fonts.weights.medium,
      cursor: "default",
    },
    dot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: theme.colors.blockchain,
    },
    hash: {
      fontSize: theme.fonts.sizes.xs,
      color: theme.colors.textMuted,
      fontFamily: "monospace",
      marginTop: "2px",
    },
  };

  return (
    <div>
      <span style={styles.badge}>
        <span style={styles.dot} />
        {small ? "On-chain" : `Verified on Blockchain`}
        {recordId && !small && (
          <span style={{ opacity: 0.7 }}>#{recordId}</span>
        )}
      </span>
      {txHash && !small && <p style={styles.hash}>{shortenHash(txHash)}</p>}
    </div>
  );
};

export default BlockchainBadge;
