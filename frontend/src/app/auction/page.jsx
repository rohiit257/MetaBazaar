"use client";

import { useState, useEffect, useContext } from "react";
import { ethers, parseEther, formatEther } from "ethers";
import { WalletContext } from "../../context/wallet";
import MarketplaceJson from "../marketplace.json";
import Navbar from "../components/Navbar";

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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJson.abi, signer);
      const auctionData = await contract.getAuctionedNFTs();
      
      setAuctions(auctionData.filter((auction) => auction.active));
    } catch (error) {
      console.error("Error fetching auctions:", error);
    }
    setLoading(false);
  };

  const placeBid = async (tokenId) => {
    try {
      if (!bidAmount) {
        alert("Enter a valid bid amount");
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJson.abi, signer);
      const tx = await contract.bid(tokenId, { value: parseEther(bidAmount) });
      await tx.wait();
      fetchAuctions();
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  const finalizeAuction = async (tokenId) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJson.abi, signer);
      const tx = await contract.finalizeAuction(tokenId);
      await tx.wait();
      fetchAuctions();
    } catch (error) {
      console.error("Error finalizing auction:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 font-mono">
        <h1 className="text-3xl font-bold">Live NFT Auctions</h1>
        {loading ? (
          <p>Loading auctions...</p>
        ) : (
          <div className="grid grid-cols-3 gap-6 mt-4">
            {auctions.map((auction, index) => (
              <div key={index} className="border p-4 rounded-lg shadow-md">
                <p>Token ID: {auction.tokenId.toString()}</p>
                <p>Highest Bid: {formatEther(auction.highestBid)} ETH</p>
                <p>End Time: {new Date(Number(auction.endTime) * 1000).toLocaleString()}</p>
                <input
                  type="text"
                  placeholder="Bid Amount in ETH"
                  className="border p-2 mt-2 w-full"
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <button
                  onClick={() => placeBid(auction.tokenId)}
                  className="bg-sky-400 text-white p-2 mt-2 w-full rounded"
                >
                  Place Bid
                </button>
                {Date.now() / 1000 > Number(auction.endTime) && (
                  <button
                    onClick={() => finalizeAuction(auction.tokenId)}
                    className="bg-green-500 text-white p-2 mt-2 w-full rounded"
                  >
                    Finalize Auction
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
