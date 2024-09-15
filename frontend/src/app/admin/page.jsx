"use client";

import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import Navbar from "../components/Navbar";
import { WalletContext } from "@/context/wallet";
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [listingFee, setListingFee] = useState("");
  const [newListingFee, setNewListingFee] = useState("");
  const [royaltyFee, setRoyaltyFee] = useState("");
  const [newRoyaltyFee, setNewRoyaltyFee] = useState("");
  const [creators, setCreators] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

  // Ensure only marketplace owner can access this page
  useEffect(() => {
    const checkOwner = async () => {
      if (!signer) return;
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const currentAddress = await signer.getAddress();
      const ownerAddress = await contract.marketplaceOwner();
      if (currentAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        alert("You are not authorized to access this page.");
        router.push("/"); // Redirect to homepage
      }
    };

    checkOwner();
  }, [signer, router]);

  // Fetch all listed NFTs, admin data, and creators
  useEffect(() => {
    const fetchAdminData = async () => {
      const itemsArray = [];
      const creatorsMap = new Map();
      if (!signer) return;

      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );

      try {
        // Fetch current listing fee and royalty fee
        const listingFeePercent = await contract.getListingFeePercent();
        const royaltyPercent = await contract.getRoyaltyPercent();
        setListingFee(ethers.formatEther(listingFeePercent));
        setRoyaltyFee(ethers.formatEther(royaltyPercent));

        // Fetch all listed NFTs and creators
        const transaction = await contract.getAllListedNFTs();
        for (const nft of transaction) {
          const tokenId = parseInt(nft.tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const { data: meta } = await axios.get(tokenURI);
          const price = ethers.formatEther(nft.price);

          const item = {
            price: parseFloat(price),
            tokenId,
            seller: nft.seller,
            owner: nft.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
          itemsArray.push(item);

          // Collect creator data
          const creator = nft.seller; // Assuming 'seller' is the creator's address
          if (creatorsMap.has(creator)) {
            creatorsMap.set(creator, creatorsMap.get(creator) + 1);
          } else {
            creatorsMap.set(creator, 1); // Initialize creator's count
          }
        }

        // Convert creators map to array of objects
        const creatorsArray = Array.from(creatorsMap, ([address, nftCount]) => ({
          address,
          nftCount,
        }));

        setItems(itemsArray);
        setCreators(creatorsArray);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, [signer]);

  // Function to update listing fee
  const updateListingFee = async () => {
    try {
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateListingFeePercent(ethers.parseEther(newListingFee));
      await tx.wait();
      alert("Listing fee updated successfully");
      setListingFee(newListingFee);
      setNewListingFee("");
    } catch (error) {
      console.error("Error updating listing fee:", error);
    }
  };

  // Function to update royalty fee
  const updateRoyaltyFee = async () => {
    try {
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateRoyaltyPercent(ethers.parseEther(newRoyaltyFee));
      await tx.wait();
      alert("Royalty fee updated successfully");
      setRoyaltyFee(newRoyaltyFee);
      setNewRoyaltyFee("");
    } catch (error) {
      console.error("Error updating royalty fee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <h1 className="text-2xl font-bold text-slate-300 mb-6">
                Admin Dashboard
              </h1>

              {/* Display and update Listing Fee */}
              <div className="mb-8">
                <h2 className="text-xl text-slate-300">Current Listing Fee: {listingFee}%</h2>
                <input
                  type="number"
                  value={newListingFee}
                  onChange={(e) => setNewListingFee(e.target.value)}
                  placeholder="Enter new listing fee"
                  className="block mt-2 p-2 border border-zinc-800 bg-zinc-950 text-slate-300 rounded"
                />
                <button
                  onClick={updateListingFee}
                  className="mt-2 px-4 py-2 bg-pink-500 text-white rounded"
                >
                  Update Listing Fee
                </button>
              </div>

              {/* Display and update Royalty Fee */}
              <div className="mb-8">
                <h2 className="text-xl text-slate-300">Current Royalty Fee: {royaltyFee}%</h2>
                <input
                  type="number"
                  value={newRoyaltyFee}
                  onChange={(e) => setNewRoyaltyFee(e.target.value)}
                  placeholder="Enter new royalty fee"
                  className="block mt-2 p-2 border border-zinc-800 bg-zinc-950 text-slate-300 rounded"
                />
                <button
                  onClick={updateRoyaltyFee}
                  className="mt-2 px-4 py-2 bg-pink-500 text-white rounded"
                >
                  Update Royalty Fee
                </button>
              </div>

              {/* Display Listed NFTs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <NFTCard key={index} item={item} />
                  ))
                ) : (
                  <div className="text-center text-slate-300">
                    No NFTs listed at the moment.
                  </div>
                )}
              </div>

              {/* Display Creators */}
              <div className="mt-8">
                <h2 className="text-xl text-slate-300 mb-4">Creators List</h2>
                {creators.length > 0 ? (
                  <ul className="space-y-4">
                    {creators.map((creator, index) => (
                      <li key={index} className="text-slate-300">
                        <span className="font-bold">{creator.address}:</span> {creator.nftCount} NFTs
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-slate-300">
                    No creators found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-300 font-space-mono">
              YOU ARE NOT CONNECTED TO YOUR WALLET
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
