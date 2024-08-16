"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const { isConnected, signer } = useContext(WalletContext);

  // Fetch all listed NFTs
  async function getNFTitems() {
    if (!signer) return [];

    const contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    try {
      const transaction = await contract.getAllListedNFTs();
      console.log("Transaction data:", transaction);

      const itemsArray = await Promise.all(transaction.map(async (i) => {
        const tokenId = parseInt(i.tokenId);
        console.log(`Fetching token URI for tokenId ${tokenId}`);
        const tokenURI = await contract.tokenURI(tokenId);
        console.log(`Token URI: ${tokenURI}`);

        try {
          const meta = (await axios.get(tokenURI)).data;
          console.log(`Meta data for tokenId ${tokenId}:`, meta);
          
          const price = ethers.formatEther(i.price);

          return {
            price,
            tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
        } catch (err) {
          console.error(`Error fetching metadata for tokenId ${tokenId}:`, err);
          return null;
        }
      }));

      return itemsArray.filter(item => item !== null);
    } catch (error) {
      console.error("Error fetching NFT items:", error);
      setError("Failed to fetch NFT items. Please try again later.");
      return [];
    }
  }

  useEffect(() => {
    if (isConnected) {
      const fetchData = async () => {
        const itemsArray = await getNFTitems();
        setItems(itemsArray);
      };

      fetchData();
    }
  }, [isConnected, signer]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="mt-8">
          {isConnected ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">NFT Marketplace</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={index} className="border p-4 bg-white rounded shadow-md">
                      <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-700 mb-2">{item.description}</p>
                      <p className="text-gray-900 font-bold">Price: {item.price} ETH</p>
                      <p className="text-gray-500">Seller: {item.seller}</p>
                      <p className="text-gray-500">Owner: {item.owner}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500">No NFTs Listed Now...</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">You are not connected...</div>
          )}
          {error && <div className="text-center text-red-500 mt-4">{error}</div>}
        </div>
      </div>
    </div>
  );
}
