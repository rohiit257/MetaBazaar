'use client'
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import Navbar from "../components/Navbar";
import { Vortex } from "../components/ui/vortex";
import { FlipWords } from "../components/ui/flip-words";
import { WalletContext } from "@/context/wallet";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
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

  // Filter items based on search query
  const filteredItems = items ? items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <div className="text-center mb-8 font-space-mono">
                <form className="max-w-md mx-auto">
                  <label htmlFor="default-search" className="mb-2 text-sm font-medium text-slate-300 sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                    </div>
                    <input
                      type="search"
                      id="default-search"
                      className="block w-full p-4 ps-10 text-sm text-slate-300 border border-zinc-800 rounded-lg bg-black focus:ring-sky-300 focus:border-sky-300"
                      placeholder="SEARCH COLLECTIONS....."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      required
                    />
                    
                  </div>
                </form>
              </div>
              {filteredItems?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map((value, index) => (
                    <NFTCard item={value} key={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500"><FlipWords words={["Fetching","Nft's",".","..","..."]}/></div>
              )}
            </>
          ) : (
            <div className="relative text-center text-slate-300 font-space-mono">
              <div className="absolute inset-0 flex items-center justify-center z-0">
                
              </div>
              <div className="relative z-10 font-bold">
                YOU ARE NOT CONNECTED TO YOUR WALLET
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
