"use client";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import NFTTable from "../components/nftTable/NFTTable";
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
import { WalletContext } from "@/context/wallet";
import { useRouter } from 'next/navigation';

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

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
          const reviews = meta.reviews || 0;

          const item = {
            price: parseFloat(price),
            tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            dateListed: i.dateListed,
            reviews,
          };

          itemsArray.push(item);
        } catch (err) {
          console.error(
            `Error fetching metadata for tokenId ${tokenId}:`,
            err.response ? err.response.data : err.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Error fetching NFT items:",
        error.response ? error.response.data : error.message
      );
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

  const filteredItems = items
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const sortedItems = filteredItems.sort((a, b) => {
    if (sortOption === "low-high") {
      return a.price - b.price;
    } else if (sortOption === "high-low") {
      return b.price - a.price;
    } else if (sortOption === "newest") {
      return new Date(b.dateListed) - new Date(a.dateListed);
    } else if (sortOption === "most-reviewed") {
      return b.reviews - a.reviews;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <div className="flex justify-center items-center space-x-4 max-w-xs mx-auto mb-4 font-space-mono">
                {/* Toggle Slider */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={(e) =>
                      setViewMode(e.target.checked ? "card" : "table")
                    }
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-pink-400 peer-focus:ring-4 peer-focus:ring-pink-300 transition-all relative">
                    <span className="absolute w-5 h-5 bg-white rounded-full top-0.5 left-[2px] transition-all transform peer-checked:translate-x-full"></span>
                  </div>
                  <span className="ms-3 text-sm font-medium text-slate-300">
                    {viewMode === "card" ? "Table" : "Card"}
                  </span>
                </label>

                {/* Search Bar */}
                <form className="flex-1">
                  <label
                    htmlFor="default-search"
                    className="mb-2 text-sm font-medium bg-zinc-950 text-slate-300 sr-only"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="search"
                      id="default-search"
                      className="block w-[350px] p-4 ps-10 text-sm text-slate-300 border border-zinc-800 rounded-lg bg-zinc-950 focus:ring-pink-300 focus:border-pink-300"
                      placeholder="SEARCH COLLECTIONS....."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      required
                    />
                  </div>
                </form>

                {/* Sort Dropdown */}
                <select
                  className="w-[150px] text-slate-300 border border-zinc-800 bg-zinc-950 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="">Sort By Price</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  
                </select>
              </div>

              {/* Display NFTs */}
              {sortedItems?.length > 0 ? (
                viewMode === "card" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedItems.map((value, index) => (
                      <NFTCard item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <NFTTable items={sortedItems} />
                )
              ) : (
                <div className="text-center text-gray-500">
                  <FlipWords words={["Fetching", "Nft's", ".", "..", "..."]} />
                </div>
              )}
            </>
          ) : (
            <div className="relative text-center text-slate-300 font-space-mono">
              <div className="absolute inset-0 flex items-center justify-center z-0"></div>
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
