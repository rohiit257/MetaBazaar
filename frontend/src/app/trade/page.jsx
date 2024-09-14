"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import marketplace from "./../marketplace.json";
import { WalletContext } from "@/context/wallet";
import Navbar from "../components/Navbar";

export default function TRADE() {
  const [formParams, updateFormParams] = useState({
    userId: "",
    nftTokenId: "",
  });
  const [message, updateMessage] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnContent, setBtnContent] = useState("TRADE NFT");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isConnected, signer } = useContext(WalletContext);

  async function tradeNFT(e) {
    e.preventDefault(); // Prevent form submission

    const { userId, nftTokenId } = formParams;
    if (!userId || !nftTokenId) {
      updateMessage("Please fill all the fields!");
      return;
    }

    try {
      setBtnContent("Processing...");
      setLoading(true);

      let contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );

      // Assuming there is a method in your contract for transferring NFTs
      let transaction = await contract.tradeNFT(userId, nftTokenId);
      await transaction.wait();

      setBtnContent("TRADE NFT");
      setBtnDisabled(false);
      setLoading(false);
      updateMessage("");
      updateFormParams({ userId: "", nftTokenId: "" });
      alert("Successfully traded the NFT!");
      router.push("/marketplace");
    } catch (e) {
      alert("Trade error: " + e.message);
      console.error("Error trading NFT:", e);
      setBtnContent("TRADE NFT");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen font-space-mono">
      <Navbar />
      
      {isConnected ? (
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="max-w-md w-full bg-zinc-950 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-slate-300">TRADE YOUR NFT</h2>
            <form className="space-y-4" onSubmit={tradeNFT}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  USER ID
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 bg-black text-white border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-sky-300 focus:border-sky-300 sm:text-sm transition-transform hover:scale-105"
                  value={formParams.userId}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, userId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  NFT TOKEN ID
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 bg-black text-white border border-zinc-800 rounded-md shadow-sm focus:outline-none focus:ring-sky-300 focus:border-sky-300 sm:text-sm transition-transform hover:scale-105"
                  value={formParams.nftTokenId}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, nftTokenId: e.target.value })
                  }
                />
              </div>
              <div className="text-red-500">{message}</div>
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md text-zinc-800 ${
                  btnDisabled
                    ? "bg-sky-200 cursor-not-allowed"
                    : "bg-pink-300 hover:bg-pink-400"
                }`}
                disabled={btnDisabled}
              >
                {loading && (
                  <span className="animate-spin h-5 w-5 border-4 border-t-4 rounded-full mr-2 inline-block"></span>
                )}
                {btnContent}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="font-bold text-lg text-gray-700 bg-black ">
            CONNECT YOUR WALLET TO CONTINUE......
          </div>
        </div>
      )}
    </div>
  );
}
