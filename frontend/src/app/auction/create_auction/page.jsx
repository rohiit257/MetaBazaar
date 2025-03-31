"use client";

import { useState, useContext } from "react";
import { ethers } from "ethers";
import { WalletContext } from "../../../context/wallet";
import MarketplaceJson from "../../marketplace.json";
import Navbar from "@/app/components/Navbar";
import { Gavel, Hash, Timer, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar />
      <div className="p-4 sm:p-8">
        <div className="container mx-auto max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gavel className="w-8 h-8 text-pink-400" />
              <h1 className="text-4xl md:text-5xl font-bold text-slate-200 font-space-mono">
                Create NFT Auction
              </h1>
            </div>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Start an auction for your NFT. Set the duration and let the highest bidder win.
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              {/* Token ID Input */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                  <Hash className="w-4 h-4 text-slate-500" />
                  <span>NFT Token ID</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter the Token ID of your NFT"
                  className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                />
              </div>

              {/* Duration Input */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <span>Auction Duration (seconds)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter duration in seconds (e.g., 86400 for 24 hours)"
                  className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={startAuction}
                className="w-full py-3 px-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    <span>Starting Auction...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Start Auction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
