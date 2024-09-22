'use client'
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/NFTCard/NFTCard";
import SalesChart from "../components/SalesChart";
import { WalletContext } from "../../context/wallet";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Navbar from "../components/Navbar";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [listingFee, setListingFee] = useState("");
  const [royaltyFee, setRoyaltyFee] = useState("");
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [marketCap, setMarketCap] = useState(0);
  const [creators, setCreators] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

  useEffect(() => {
    const checkOwner = async () => {
      if (!signer) return;
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const currentAddress = await signer.getAddress();
      const ownerAddress = await contract.marketplaceOwner();
      if (currentAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        toast("You are not authorized to access this page.");
        router.push("/"); // Redirect to homepage
      }
    };

    checkOwner();
  }, [signer, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const itemsArray = [];
      const creatorsMap = new Map();
      let totalNFTs = 0;
      let marketCap = 0;
      const salesArray = [];

      if (!signer) return;

      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );

      try {
        // Fetch current listing fee and royalty fee
        const listingFeePercent = await contract.getListingFeePercent();
        const royaltyPercent = await contract.getRoyaltyPercent();
        setListingFee(ethers.formatEther(listingFeePercent));
        setRoyaltyFee(ethers.formatEther(royaltyPercent));

        // Fetch all listed NFTs and creators
        const transaction = await contract.getAllListedNFTs();
        totalNFTs = transaction.length;

        for (const nft of transaction) {
          const tokenId = parseInt(nft.tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const { data: meta } = await axios.get(tokenURI);
          const price = ethers.formatEther(nft.price);

          const item = {
            price: parseFloat(price),
            tokenId,
            seller: nft.seller,
            owner: nft.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
          itemsArray.push(item);

          // Collect creator data
          const creator = nft.seller; // Assuming 'seller' is the creator's address
          if (creatorsMap.has(creator)) {
            creatorsMap.set(creator, creatorsMap.get(creator) + 1);
          } else {
            creatorsMap.set(creator, 1); // Initialize creator's count
          }

          marketCap += parseFloat(price); // Calculate market cap

          // Prepare sales data
          salesArray.push({
            date: new Date().toLocaleDateString(), // Placeholder: use actual date if available
            amount: parseFloat(price),
          });
        }

        // Convert creators map to array of objects
        const creatorsArray = Array.from(creatorsMap, ([address, nftCount]) => ({
          address,
          nftCount,
        }));

        setItems(itemsArray);
        setCreators(creatorsArray);
        setTotalNFTs(totalNFTs);
        setMarketCap(marketCap.toFixed(2));
        setSalesData(salesArray);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, [signer]);

  // Function to update listing fee
  const updateListingFee = async () => {
    try {
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateListingFeePercent(ethers.parseEther(newListingFee));
      await tx.wait();
      alert("Listing fee updated successfully");
      setListingFee(newListingFee);
      setNewListingFee("");
    } catch (error) {
      console.error("Error updating listing fee:", error);
    }
  };

  // Function to update royalty fee
  const updateRoyaltyFee = async () => {
    try {
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateRoyaltyPercent(ethers.parseEther(newRoyaltyFee));
      await tx.wait();
      alert("Royalty fee updated successfully");
      setRoyaltyFee(newRoyaltyFee);
      setNewRoyaltyFee("");
    } catch (error) {
      console.error("Error updating royalty fee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-space-mono">
      <Navbar/>
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
            
              <h1 className="text-2xl font-bold text-slate-300 mb-6">
                Admin Dashboard
                
              </h1>
              {/* Update Fees Button */}
              <div className="m-5 text-right">
                <button
                  onClick={() => router.push('/admin/updatefees')}
                  className="px-4 py-2 bg-sky-300 hover:bg-sky-400 text-white rounded"
                >
                  Update Fees
                </button>
              </div>

              {/* Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-300">Listing Fee</h3>
                  <p className="text-xl text-slate-300">{listingFee}%</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-300">Royalty Fee</h3>
                  <p className="text-xl text-slate-300">{royaltyFee}%</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-300">Total NFTs</h3>
                  <p className="text-xl text-slate-300">{totalNFTs}</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-slate-300">Market Cap</h3>
                  <p className="text-xl text-slate-300">{marketCap} ETH</p>
                </div>
              </div>

              {/* Creators and Sales Data Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Creators List */}
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <h2 className="text-xl font-bold text-slate-300 mb-4">Creators List</h2>
                  {creators.length > 0 ? (
                    <ul className="space-y-4">
                      {creators.map((creator, index) => (
                        <li key={index} className="text-slate-300">
                          <span className="font-bold">{creator.address}:</span> {creator.nftCount} NFTs
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-slate-300">
                      No creators found.
                    </div>
                  )}
                </div>

                {/* Sales Data Graph */}
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <h2 className="text-xl font-bold text-slate-300 mb-4">Sales Data</h2>
                  {/* Graph Component */}
                  <SalesChart data={salesData} />
                </div>
              </div>

              {/* Display Listed NFTs */}
              <h1 className="text-2xl font-bold text-slate-300 mb-6">
                Listed NFT
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <NFTCard key={index} item={item} />
                  ))
                ) : (
                  <div className="text-center text-slate-300">
                    No NFTs listed at the moment.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-300 font-space-mono">
              YOU ARE NOT CONNECTED TO YOUR WALLET
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
