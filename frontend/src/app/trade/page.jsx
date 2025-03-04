"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import marketplace from "./../marketplace.json";
import { WalletContext } from "@/context/wallet";
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
// Assuming you have a FlipWords component

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
        marketplace.address.trim(),
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
    <div className="relative w-full h-screen bg-zinc-950 font-space-mono overflow-hidden">
      <Navbar />

      {isConnected ? (
        <div className="mx-auto max-w-7xl h-full lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          {/* Left Section */}
          <div className="flex flex-col justify-center px-4 py-12 md:py-16 lg:col-span-7 lg:gap-x-6 lg:px-6 lg:py-24 xl:col-span-6 h-full">
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-300 md:text-4xl lg:text-5xl">
              Trade with <FlipWords words={['Friends','Creators']}/> Around the Globe
            </h1>
            <p className="mt-8 text-lg text-gray-700">
              Trade your NFTs with ease. Enter the details below to start trading.
            </p>
            <form className="mt-8 flex flex-col space-y-4" onSubmit={tradeNFT}>
              <div className="flex flex-col space-y-2">
                <label htmlFor="userId" className="text-sm font-medium text-gray-700">User ID</label>
                <input
                  className="flex w-full rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  placeholder="eg-0xD9044DeF2F3B89D822585A6657C56f47a834a3da"
                  id="userId"
                  value={formParams.userId}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, userId: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="nftTokenId" className="text-sm font-medium text-gray-700">NFT Token ID</label>
                <input
                  className="flex w-full rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  placeholder="eg-2"
                  id="nftTokenId"
                  value={formParams.nftTokenId}
                  onChange={(e) =>
                    updateFormParams({ ...formParams, nftTokenId: e.target.value })
                  }
                />
              </div>
              <div>
                <button
                  type="submit"
                  className={`rounded-md px-3 py-2.5 text-sm font-semibold text-white shadow-sm ${
                    btnDisabled ? "bg-sky-200 cursor-not-allowed" : "bg-pink-400 hover:bg-black/80"
                  }`}
                  disabled={btnDisabled}
                >
                  {loading && (
                    <span className="animate-spin h-5 w-5 border-4 border-t-4 rounded-full mr-2 inline-block"></span>
                  )}
                  {btnContent}
                </button>
              </div>
              <div className="text-red-500">{message}</div>
            </form>
          </div>

          {/* Right Section with Image */}
          <div className="relative lg:col-span-5 xl:col-span-6 h-full flex justify-center items-center">
            <img
              className="object-cover w-full h-[80vh] max-h-full"
              src="https://plus.unsplash.com/premium_photo-1679079456783-5d862f755557?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjQ3fHxtYW4lMjB3aXRoJTIwbGFwdG9wfGVufDB8fDB8fA%3D%3D&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=60"
              alt="NFT Trading"
            />
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
