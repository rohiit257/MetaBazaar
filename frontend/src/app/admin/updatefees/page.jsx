"use client";

import { useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../../marketplace.json";
import { WalletContext } from "@/context/wallet";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { toast } from "sonner";
import { 
  Settings, 
  Coins, 
  Percent, 
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react";

const MARKETPLACE_OWNER = "0xf29bbCFB987F3618515ddDe75D6CAd34cc1855D7";
const MARKETPLACE_ADDRESS = MarketplaceJson.address.trim();

export default function UpdateFeesPage() {
  const [newListingFee, setNewListingFee] = useState("");
  const [newRoyaltyFee, setNewRoyaltyFee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

  useEffect(() => {
    const checkOwner = async () => {
      if (!signer) return;
      try {
        const currentAddress = await signer.getAddress();
        if (currentAddress.toLowerCase() !== MARKETPLACE_OWNER.toLowerCase()) {
          toast.error("You are not authorized to access this page.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking owner:", error);
        toast.error("Error verifying admin access.");
        router.push("/");
      }
    };

    checkOwner();
  }, [signer, router]);

  const updateListingFee = async () => {
    if (!newListingFee || isNaN(newListingFee)) {
      toast.error("Please enter a valid listing fee");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateListingFeePercent(ethers.parseEther(newListingFee));
      await tx.wait();
      toast.success("Listing fee updated successfully");
      setNewListingFee("");
    } catch (error) {
      console.error("Error updating listing fee:", error);
      setError("Failed to update listing fee. Please try again.");
      toast.error("Error updating listing fee");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoyaltyFee = async () => {
    if (!newRoyaltyFee || isNaN(newRoyaltyFee)) {
      toast.error("Please enter a valid royalty fee");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateRoyaltyPercent(ethers.parseEther(newRoyaltyFee));
      await tx.wait();
      toast.success("Royalty fee updated successfully");
      setNewRoyaltyFee("");
    } catch (error) {
      console.error("Error updating royalty fee:", error);
      setError("Failed to update royalty fee. Please try again.");
      toast.error("Error updating royalty fee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <button 
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-pink-400" />
              <h1 className="text-2xl font-bold text-slate-200">Update Fees</h1>
            </div>
          </div>

          {isConnected ? (
            <div className="space-y-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Update Listing Fee */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Percent className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold text-slate-200">Update Listing Fee</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">Set the percentage fee for listing NFTs</p>
                <div className="space-y-4">
                  <input
                    type="number"
                    value={newListingFee}
                    onChange={(e) => setNewListingFee(e.target.value)}
                    placeholder="Enter new listing fee percentage"
                    className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    disabled={isLoading}
                  />
                  <button
                    onClick={updateListingFee}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Listing Fee</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Update Royalty Fee */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Coins className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold text-slate-200">Update Royalty Fee</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">Set the percentage fee for NFT sales</p>
                <div className="space-y-4">
                  <input
                    type="number"
                    value={newRoyaltyFee}
                    onChange={(e) => setNewRoyaltyFee(e.target.value)}
                    placeholder="Enter new royalty fee percentage"
                    className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    disabled={isLoading}
                  />
                  <button
                    onClick={updateRoyaltyFee}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Royalty Fee</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-200 mb-2">Wallet Not Connected</h2>
              <p className="text-slate-400">Please connect your wallet to update fees.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}