'use client'
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import NFTTable from "../components/nftTable/NFTTable"; // Import NFTTable component
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
import { WalletContext } from "@/context/wallet";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [sortOption, setSortOption] = useState("");  // State for sorting option
  const [viewMode, setViewMode] = useState("card");  // State for toggle (card or table view)
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

          // Assuming reviews are part of the metadata or fetched from another source
          const reviews = meta.reviews || 0; // Default to 0 reviews if not present

          const item = {
            price: parseFloat(price),  // Ensure price is a number for sorting
            tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            dateListed: i.dateListed,  // Assuming you have a date field
            reviews,  // Adding reviews to the item object
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

  // Sort items based on sort option
  const sortedItems = filteredItems.sort((a, b) => {
    if (sortOption === "low-high") {
      return a.price - b.price; // Sort by price (low to high)
    } else if (sortOption === "high-low") {
      return b.price - a.price; // Sort by price (high to low)
    } else if (sortOption === "newest") {
      return new Date(b.dateListed) - new Date(a.dateListed); // Sort by newest
    } else if (sortOption === "most-reviewed") {
      return b.reviews - a.reviews; // Sort by most reviewed
    }
    return 0; // Default
  });

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <div className="text-center mb-8 font-space-mono">
                {/* Search Bar, Sort Dropdown, and Toggle */}
                <div className="flex justify-center items-center space-x-4 max-w-md mx-auto mb-4">
                  {/* Search Bar */}
                  <form className="flex-1">
                    <label
                      htmlFor="default-search"
                      className="mb-2 text-sm font-medium text-slate-300 sr-only"
                    >
                      Search
                    </label>
                    <div className="relative">
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

                  {/* Sort Dropdown */}
                  <select
                    className="text-slate-300 border border-zinc-800 bg-black bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="">Filter</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>

                  {/* Toggle Button for View Mode */}
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onChange={(e) => setViewMode(e.target.checked ? "table" : "card")} // Toggle view
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                      {viewMode === "card" ? "Card View" : "Table View"}
                    </span>
                  </label>
                </div>
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
                  <NFTTable items={sortedItems} /> // Tabular View
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
