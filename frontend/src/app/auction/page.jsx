"use client";

import { useState, useEffect, useContext } from "react";
import { ethers, parseEther, formatEther } from "ethers";
import { WalletContext } from "../../context/wallet";
import MarketplaceJson from "../marketplace.json";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { FlipWords } from "../components/ui/flip-words";
import { Coins, Timer, Hash, Gavel, CheckCircle2, ArrowRight } from "lucide-react";

const CONTRACT_ADDRESS = MarketplaceJson.address.trim();

export default function AuctionPage() {
  const { signer } = useContext(WalletContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (signer) {
      fetchAuctions();
    }
  }, [signer]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceJson.abi,
        signer
      );
  
      // Fetch ALL auction data
      const auctionData = await contract.getAuctionedNFTs();
  
      // Fetch NFT metadata (image) for each auction
      const auctionsWithDetails = await Promise.all(
        auctionData.map(async (auction) => {
          try {
            // Fetch tokenURI from contract
            const tokenURI = await contract.tokenURI(auction.tokenId);
            const response = await fetch(tokenURI);
            const metadata = await response.json();
  
            return {
              tokenId: auction.tokenId.toString(),
              highestBid: auction.highestBid.toString(),
              endTime: auction.endTime.toString(),
              active: auction.active,
              image: metadata.image || null, // Handle missing image
            };
          } catch (error) {
            console.error(
              `Error fetching metadata for Token ID ${auction.tokenId}:`,
              error
            );
            return {
              tokenId: auction.tokenId.toString(),
              highestBid: auction.highestBid.toString(),
              endTime: auction.endTime.toString(),
              active: auction.active,
              image: null, // Set image to null if fetching fails
            };
          }
        })
      );
  
      // Remove duplicate auctions based on tokenId
      const uniqueAuctions = Object.values(
        auctionsWithDetails
          .filter((auction) => auction.active) // Only active auctions
          .reduce((acc, auction) => {
            acc[auction.tokenId] = auction; // Keep only one entry per tokenId
            return acc;
          }, {})
      );
  
      setAuctions(uniqueAuctions);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
    setLoading(false);
  };
  

  const placeBid = async (tokenId) => {
    try {
      if (!bidAmount) {
        toast("Enter a valid bid amount");
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.bid(tokenId, { value: parseEther(bidAmount) });
      await tx.wait();
      fetchAuctions();
      toast("Bid Placed Successfully")
    } catch (error) {
      toast(`${error.reason}`)
      console.error("Error placing bid:", error);
    }
  };

  const finalizeAuction = async (tokenId) => {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.finalizeAuction(tokenId);
      await tx.wait();
      fetchAuctions();
    } catch (error) {
      console.error("Error finalizing auction:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar />
      <div className="p-4 sm:p-8">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gavel className="w-8 h-8 text-pink-400" />
              <h1 className="text-4xl md:text-5xl font-bold text-slate-200 font-space-mono">
                Live NFT Auctions
              </h1>
            </div>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Place your bids on unique NFTs. The highest bidder wins when the auction ends.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <FlipWords words={["Loading", "Auctions", ".", "..", "..."]} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction, index) => {
                const hasEnded = Date.now() / 1000 > Number(auction.endTime);

                return (
                  <div
                    key={index}
                    className="group relative rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 hover:border-pink-500/50 hover:bg-zinc-900/80 transition-all duration-300 shadow-lg hover:shadow-pink-500/20 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {auction.image ? (
                        <img
                          src={auction.image}
                          alt="NFT"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center">
                          <p className="text-slate-500">No Image Available</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ArrowRight className="w-6 h-6 text-pink-400" />
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Hash className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-300">
                          Token ID: {auction.tokenId}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <Coins className="w-4 h-4 text-pink-400" />
                        <span className="text-lg font-bold text-pink-400">
                          {formatEther(auction.highestBid)} ETH
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <Timer className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400">
                          Ends: {new Date(Number(auction.endTime) * 1000).toLocaleString()}
                        </span>
                      </div>

                      {hasEnded ? (
                        <div className="flex items-center space-x-2 text-red-400 mb-4">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">Auction Ended</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Bid Amount in ETH"
                            className="w-full p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                          <button
                            onClick={() => placeBid(auction.tokenId)}
                            className="w-full py-2 px-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                            disabled={!auction.tokenId}
                          >
                            <Gavel className="w-4 h-4" />
                            <span>Place Bid</span>
                          </button>
                        </div>
                      )}

                      {hasEnded && (
                        <button
                          onClick={() => finalizeAuction(auction.tokenId)}
                          className="w-full py-2 px-4 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finalize Auction</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
