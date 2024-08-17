"use client";
import { WalletContext } from "@/context/wallet";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import GetIpfsUrlFromPinata from "@/app/utils";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";

export default function NFTPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const { isConnected, userAddress, signer } = useContext(WalletContext);
  const router = useRouter();

  // Fetch NFT Data
  async function getNFTData() {
    if (!signer || !tokenId) return;

    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    try {
      // Fetch tokenURI from contract
      let tokenURI = await contract.tokenURI(tokenId);
      console.log("Token URI:", tokenURI); // Debug log
      tokenURI = GetIpfsUrlFromPinata(tokenURI);

      // Fetch metadata from IPFS
      const metaResponse = await axios.get(tokenURI);
      const meta = metaResponse.data;
      console.log("Metadata:", meta); // Debug log

      // Fetch listing from contract
      const listedToken = await contract.getNFTListing(tokenId);
      console.log("Listed Token:", listedToken); // Debug log

      // Format data
      const item = {
        price: ethers.formatEther(listedToken.price),
        tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };
      return item;
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      return null;
    }
  }

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    async function fetchData() {
      if (!isConnected || !signer) return;

      try {
        const itemTemp = await getNFTData();
        console.log("Fetched itemTemp:", itemTemp); // Debug log
        setItem(itemTemp);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setItem(null);
      }
    }

    fetchData();
  }, [isConnected, signer]);

  // Handle buying NFT
  async function buyNFT() {
    try {
      if (!signer || !item) return;

      let contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const salePrice = ethers.parseUnits(item.price, "ether");
      setBtnContent("Processing...");
      setMsg("Buying the NFT... Please Wait (Up to 5 mins)");

      let transaction = await contract.sellNFT(tokenId, { value: salePrice });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      setMsg("");
      setBtnContent("Buy NFT");
      router.push("/");
    } catch (e) {
      console.log("Buying Error:", e);
      setMsg("Error buying NFT.");
      setBtnContent("Buy NFT");
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-space-mono ">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
        {isConnected ? (
          <div className="container mx-auto flex flex-col md:flex-row items-center m-7 p-7">
            <div className="flex-shrink-0">
              {item?.image ? (
                <Image
                  src={item.image}
                  alt={item.name || "NFT Image"}
                  width={450}
                  height={550}
                  className="rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-[520px] flex items-center justify-center text-gray-500">Image not available</div>
              )}
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex flex-col md:w-1/2">
              <div className="text-gray-700">
                <div className="text-sm font-semibold text-gray-500">Name:</div>
                <h1 className="text-3xl font-semibold text-slate-300">{item?.name || "Name not available"} #{item?.tokenId}</h1>
                <div className="my-4">
                  <div className="text-sm font-semibold text-gray-500">Description:</div>
                  <p className="leading-relaxed text-gray-600">{item?.description || "Description not available"}</p>
                </div>
                <div className="my-4">
                  <div className="text-sm font-semibold text-gray-500">Price:</div>
                  <p className="text-xl font-bold text-gray-600">{item?.price || "Price not available"} ETH</p>
                </div>
                <div className="my-4">
                  <div className="text-sm font-semibold text-gray-500">Seller:</div>
                  <p className="text-gray-600">{item?.seller || "Seller not available"}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-start">
                <div className="text-red-500 mb-2">{msg}</div>
                {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                  <div className="text-pink-300">You already own this NFT!</div>
                ) : (
                  <button
                    onClick={buyNFT}
                    className="mt-4 rounded-md bg-sky-300 px-4 py-2 text-black font-semibold shadow-sm hover:bg-sky-400"
                  >
                    {btnContent === "Processing..." && (
                      <span className="animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full inline-block mr-2"></span>
                    )}
                    {btnContent}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">You are not connected...</div>
        )}
      </div>
    </div>
  );
}
