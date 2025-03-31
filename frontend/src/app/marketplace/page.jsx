"use client";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/NFTCard";
import NFTTable from "../components/NFTTable";
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
import { WalletContext } from "@/context/wallet";
import * as Sentry from "@sentry/nextjs";
import { Search, Filter, LayoutGrid, Table2, Sparkles, ArrowRight } from "lucide-react";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const { isConnected, signer } = useContext(WalletContext);

  async function getNFTitems() {
    const itemsArray = [];

    // If the wallet is not connected, use a public provider
    const provider = signer
      ? signer
      : ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL);

    const contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      provider
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
        } catch (error) {
          Sentry.captureException(error);
          console.error(
            `Error fetching metadata for tokenId ${tokenId}:`,
            error.response ? error.response.data : error.message
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
  }, [isConnected]); // Fetch data whether connected or not

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar />
      <div className="p-4 sm:p-8">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-pink-400" />
              <h1 className="text-4xl md:text-5xl font-bold text-slate-200 font-space-mono">
                Discover Unique NFTs
              </h1>
            </div>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Explore our curated collection of unique digital assets. Find, collect, and trade NFTs from various creators.
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-xs sm:max-w-none mx-auto mb-8 font-space-mono">
            {/* Search Bar */}
            <form className="w-full sm:w-auto">
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-slate-300 sr-only"
              >
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="block w-full sm:w-[350px] p-4 pl-10 text-sm text-slate-300 border border-zinc-800/50 rounded-xl bg-zinc-900/50 backdrop-blur-sm focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
            </form>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-[150px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-slate-500" />
              </div>
              <select
                className="w-full pl-10 text-slate-300 border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/80 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 font-medium rounded-xl text-sm px-4 py-2.5 transition-all duration-200"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="most-reviewed">Most Reviewed</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center space-x-2 bg-zinc-900/50 backdrop-blur-sm p-1 rounded-xl border border-zinc-800/50">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center space-x-2 ${
                  viewMode === "table"
                    ? "bg-pink-500/20 text-pink-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Table2 className="w-4 h-4" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center space-x-2 ${
                  viewMode === "card"
                    ? "bg-pink-500/20 text-pink-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {/* Display NFTs */}
          {sortedItems?.length > 0 ? (
            viewMode === "card" ? (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedItems.map((value, index) => (
                  <NFTCard item={value} key={index} />
                ))}
              </div>
            ) : (
              <NFTTable items={sortedItems} />
            )
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <FlipWords words={["Fetching", "NFTs", ".", "..", "..."]} />
              </div>
              <p className="text-slate-500">No NFTs found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}