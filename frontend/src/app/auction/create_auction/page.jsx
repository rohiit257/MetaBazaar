"use client";

import { useState, useContext } from "react";
import { ethers } from "ethers";
import { WalletContext } from "../../../context/wallet";
import MarketplaceJson from "../../marketplace.json";
import Navbar from "@/app/components/Navbar";

const CONTRACT_ADDRESS = MarketplaceJson.address.trim();

export default function CreateAuctionPage() {
  const { signer, userAddress } = useContext(WalletContext);
  const [tokenId, setTokenId] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const startAuction = async () => {
    if (!signer || !userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJson.abi, signer);
      const tx = await contract.auctionNFT(tokenId, duration);
      await tx.wait();
      alert("Auction started successfully!");
    } catch (error) {
      console.error("Error starting auction:", error);
      alert("Error starting auction: " + error.message);
    }
    setLoading(false);
  };

  return (
   <>
   <Navbar/>
   <div className="p-6 font-mono">
      <h1 className="text-3xl text-black font-bold">Create NFT Auction</h1>
      <input
        type="text"
        placeholder="NFT Token ID"
        className="border p-2 mt-2 w-full text-"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Auction Duration (seconds)"
        className="border p-2 mt-2 w-full"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button
        onClick={startAuction}
        className="bg-sky-400 text-white p-2 mt-2 w-full rounded"
        disabled={loading}
      >
        {loading ? "Starting Auction..." : "Start Auction"}
      </button>
    </div>
   </>
  );
}
