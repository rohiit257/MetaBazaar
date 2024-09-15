"use client";

import { useContext, useState ,useEffect} from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../../marketplace.json";
import { WalletContext } from "@/context/wallet";
import { useRouter } from 'next/navigation';
import Navbar from "@/app/components/Navbar";

export default function UpdateFeesPage() {
  const [newListingFee, setNewListingFee] = useState("");
  const [newRoyaltyFee, setNewRoyaltyFee] = useState("");
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
      setNewRoyaltyFee("");
    } catch (error) {
      console.error("Error updating royalty fee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
        <Navbar/>
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <h1 className="text-2xl font-bold text-slate-300 mb-6">
                Update Fees
              </h1>

              {/* Update Listing Fee */}
              <div className="mb-8">
                <h2 className="text-xl text-slate-300 mb-2">Update Listing Fee</h2>
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

              {/* Update Royalty Fee */}
              <div className="mb-8">
                <h2 className="text-xl text-slate-300 mb-2">Update Royalty Fee</h2>
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
