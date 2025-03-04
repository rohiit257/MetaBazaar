"use client";

import { useState, useEffect, useContext } from "react";
import { ethers, parseEther, formatEther } from "ethers";
import { WalletContext } from "../../context/wallet";
import MarketplaceJson from "../marketplace.json";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

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
    <>
      <Navbar />
      <div className="p-6 font-mono">
        <h1 className="text-3xl font-bold">Live NFT Auctions</h1>
        {loading ? (
          <p>Loading auctions...</p>
        ) : (
          <div className="grid grid-cols-4 gap-6 mt-4">
            {auctions.map((auction, index) => {
              const hasEnded = Date.now() / 1000 > Number(auction.endTime);

              return (
                <div
                  key={index}
                  className="border border-zinc-700 p-4 rounded-lg shadow-md"
                >
                  {auction.image ? (
                    <img
                      src={auction.image}
                      alt="NFT"
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <p className="text-gray-500">No Image Available</p>
                  )}

                  <p>
                    <strong>Token ID:</strong>{" "}
                    {auction.tokenId ? auction.tokenId.toString() : "N/A"}
                  </p>
                  <p>
                    <strong>Highest Bid:</strong>{" "}
                    {auction.highestBid
                      ? formatEther(auction.highestBid)
                      : "0"}{" "}
                    ETH
                  </p>
                  <p>
                    <strong>End Time:</strong>{" "}
                    {auction.endTime
                      ? new Date(Number(auction.endTime) * 1000).toLocaleString()
                      : "N/A"}
                  </p>

                  {/* Show "Auction Ended" Text & Hide Bid Inputs if Ended */}
                  {hasEnded ? (
                    <p className="text-red-500 font-bold mt-2">Auction Ended</p>
                  ) : (
                    <>
                      {/* Bid Input & Button (Hidden if Auction Ended) */}
                      <input
                        type="text"
                        placeholder="Bid Amount in ETH"
                        className="border p-2 mt-2 w-full text-black"
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                      <button
                        onClick={() => placeBid(auction.tokenId)}
                        className="bg-sky-400 text-white p-2 mt-2 w-full rounded"
                        disabled={!auction.tokenId} // Prevent clicking if tokenId is invalid
                      >
                        Place Bid
                      </button>
                    </>
                  )}

                  {/* Finalize Auction Button (Only Visible if Auction Ended) */}
                  {hasEnded && (
                    <button
                      onClick={() => finalizeAuction(auction.tokenId)}
                      className="bg-green-500 text-white p-2 mt-2 w-full rounded"
                    >
                      Finalize Auction
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
