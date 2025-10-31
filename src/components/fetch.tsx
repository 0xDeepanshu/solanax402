"use client";

import React, { useState, useMemo } from "react";
import {
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";
import { log } from "console";

const USDC_MINT_DEVNET = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const TOKEN_DECIMALS = 6; // USDC on Solana = 6 decimals
const RPC_URL = "https://api.devnet.solana.com";

function USDCPayButton() {
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const connection = useMemo(() => new Connection(RPC_URL, "confirmed"), []);

  async function handleCallProtectedAPI() {
    if (!publicKey || !sendTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMessage("Requesting payment info…");

    try {
      // Step 1: Call API to get payment requirement
      const res = await fetch("/api/try", { method: "GET" });
      const data = await res.json();
      console.log(data);
      
      if (data.error === "Payment required" && data.accepts?.length > 0) {
        const info = data.accepts[0];

        // Validate it's USDC on devnet
        if (
          info.asset !== USDC_MINT_DEVNET.toString() ||
          info.network !== "solana-devnet"
        ) {
          setMessage("Unsupported payment asset or network.");
          return;
        }

        setMessage("Preparing USDC transfer…");

        const recipient = new PublicKey(info.payTo);
        const amountToSend = BigInt(info.maxAmountRequired); // e.g., 2500000n

        // Derive ATA addresses (read-only, no creation)
        const payerATA = await getAssociatedTokenAddress(USDC_MINT_DEVNET, publicKey);
        const recipientATA = await getAssociatedTokenAddress(USDC_MINT_DEVNET, recipient);

        // Create transfer instruction
        const transferIx = createTransferCheckedInstruction(
          payerATA,
          USDC_MINT_DEVNET,
          recipientATA,
          publicKey,
          amountToSend,
          TOKEN_DECIMALS
        );

        const transaction = new Transaction().add(transferIx);
        transaction.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        setMessage("Sending USDC transaction…");

        // Send via wallet
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");

        setMessage("Payment sent. Verifying with backend…");

        // Step 2: Verify with backend
        const verifyRes = await fetch("/api/try", {
          method: "POST",
          headers: {
            "X-402-Payment": signature,
          },
          body: JSON.stringify({ someData: "hello" }),
        });

        const verifyJson = await verifyRes.json();
        setMessage(verifyJson.message || "✅ Access granted!");
      } else if (data.message) {
        setMessage(data.message);
      } else {
        setMessage("Unexpected response from backend");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setMessage(`Error: ${err.message || "Transaction failed"}`);
    } finally {
      setLoading(false);
    }
  }

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <p className="text-gray-300">Connect your wallet to pay with USDC</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <WalletMultiButton />
      <button
        onClick={handleCallProtectedAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay 2.5 USDC & Access"}
      </button>
      {message && <p className="text-gray-200 mt-4 text-center">{message}</p>}
    </div>
  );
}

export default function WalletConnectAndPay() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <USDCPayButton />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}