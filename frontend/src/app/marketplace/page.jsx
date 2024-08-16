"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import Navbar from "../components/Navbar";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
  
    const contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );
  
    try {
      const transaction = await contract.getAllListedNFTs();
  
      for (const i of transaction) {
        const tokenId = parseInt(i.tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
  
        try {
          const { data: meta } = await axios.get(tokenURI);
          const price = ethers.formatEther(i.price);
  
          const item = {
            price,
            tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
  
          itemsArray.push(item);
        } catch (err) {
          console.error(`Error fetching metadata for tokenId ${tokenId}:`, err.response ? err.response.data : err.message);
        }
      }
    } catch (error) {
      console.error("Error fetching NFT items:", error.response ? error.response.data : error.message);
    }
    return itemsArray;
  }
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsArray = await getNFTitems();
        setItems(itemsArray);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900">NFT Marketplace</h2>
              </div>
              {items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items?.map((value, index) => (
                    <NFTCard item={value} key={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No NFT Listed Now...</div>
              )}
            </>
          ) : (
            <div className="text-center text-red-500">You are not connected...</div>
          )}
        </div>
      </div>
    </div>
  );
}
