import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Contract address and ABI — update address after each deploy
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Minimal ABI — only functions we need from the dashboard
const CONTRACT_ABI = [
  "function getTotalRecords() view returns (uint256)",
  "function getFraudRecord(uint256 _recordId) view returns (uint256, string, uint256, uint256, string, string[3], int256[3], string[3])",
  "function isTransactionFlagged(string _transactionId) view returns (bool)",
  "event FraudLogged(uint256 indexed recordId, string transactionId, uint256 confidenceScore, uint256 timestamp)",
];

export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [txHistory, setTxHistory] = useState([]);

  // Check if MetaMask is installed
  const isMetaMaskInstalled =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  // Load contract instance
  const loadContract = useCallback(async (signer) => {
    try {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );
      setContract(contractInstance);
      return contractInstance;
    } catch (err) {
      console.error("Failed to load contract:", err);
      return null;
    }
  }, []);

  // Connect MetaMask wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask not installed — please install it first");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Check we are on the right network
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(chainIdHex, 16);

      if (currentChainId !== 31337) {
        try {
          // Try switching to existing Hardhat network
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x7a69" }],
          });
        } catch (switchError) {
          setError(
            "Please manually switch to Hardhat Local network in MetaMask",
          );
          setConnecting(false);
          return;
        }
      }

      // Set up provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();

      // Get balance
      const balanceWei = await web3Provider.getBalance(accounts[0]);
      const balanceEth = ethers.formatEther(balanceWei);

      setProvider(web3Provider);
      setAccount(accounts[0]);
      setBalance(parseFloat(balanceEth).toFixed(4));
      setChainId(currentChainId);
      setConnected(true);

      // Load contract
      await loadContract(signer);

      // Listen for fraud events on blockchain
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Provider,
      );

      contractInstance.on(
        "FraudLogged",
        (recordId, transactionId, confidenceScore, timestamp) => {
          const newTx = {
            recordId: recordId.toString(),
            transactionId: transactionId,
            confidence: (Number(confidenceScore) / 100).toFixed(2),
            timestamp: new Date(Number(timestamp) * 1000).toISOString(),
            type: "FraudLogged",
          };
          setTxHistory((prev) => [newTx, ...prev].slice(0, 10));
        },
      );
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected — please accept in MetaMask");
      } else {
        setError(`Connection failed: ${err.message}`);
      }
    } finally {
      setConnecting(false);
    }
  }, [isMetaMaskInstalled, loadContract]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setConnected(false);
    setProvider(null);
    setContract(null);
    setTxHistory([]);
  }, []);

  // Get total records from blockchain via MetaMask
  const getTotalRecords = useCallback(async () => {
    if (!contract) return 0;
    try {
      const total = await contract.getTotalRecords();
      return Number(total);
    } catch {
      return 0;
    }
  }, [contract]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChange = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountChange);
    window.ethereum.on("chainChanged", handleChainChange);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
      window.ethereum.removeListener("chainChanged", handleChainChange);
    };
  }, [isMetaMaskInstalled, disconnect]);

  return {
    account,
    balance,
    chainId,
    connected,
    connecting,
    error,
    contract,
    txHistory,
    isMetaMaskInstalled,
    connect,
    disconnect,
    getTotalRecords,
  };
};
