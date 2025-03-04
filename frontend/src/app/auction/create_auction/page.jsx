"use client";

import { useState, useContext } from "react";
import { ethers } from "ethers";
import { WalletContext } from "../../../context/wallet";
import MarketplaceJson from "../../marketplace.json";
import Navbar from "@/app/components/Navbar";
import { Vortex } from "@/app/components/ui/vortex";
import { toast } from "sonner";

const CONTRACT_ADDRESS = MarketplaceJson.address.trim();

export default function CreateAuctionPage() {
  const { signer, userAddress } = useContext(WalletContext);
  const [tokenId, setTokenId] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const startAuction = async () => {
    if (!signer || !userAddress) {
      toast("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJson.abi, signer);
      const tx = await contract.auctionNFT(tokenId, duration);
      await tx.wait();
      toast("Auction started successfully!");
      Router.push("/auction")
    } catch (error) {
      console.error("Error starting auction:", error);
      toast(`Error starting auction: ${error.reason}`);
    }
    setLoading(false);
  };

  return (
    <>
    
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-black font-mono">
        
        
        <div className="border border-zinc-700 bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-semibold text-zinc-200 text-center">Create NFT Auction</h1>
          
          <input
            type="text"
            placeholder="NFT Token ID"
            className="border border-zinc-600 bg-black text-white p-3 mt-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Auction Duration (seconds)"
            className="border border-zinc-600 bg-black text-white p-3 mt-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          
          <button
            onClick={startAuction}
            className={`mt-6 w-full p-3 rounded-md font-semibold transition ${
              loading ? "bg-gray-700 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600"
            } text-white`}
            disabled={loading}
          >
            {loading ? "Starting Auction..." : "Start Auction"}
          </button>
        </div>
      </div>
    </>
  );
}
