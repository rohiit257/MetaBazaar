'use client'
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/NFTCard";
import SalesChart from "../components/SalesChart";
import { WalletContext } from "../../context/wallet";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { 
  LayoutDashboard, 
  Settings, 
  Coins, 
  ImageIcon, 
  Users, 
  BarChart2, 
  ArrowRight,
  DollarSign,
  Percent,
  Package,
  TrendingUp,
  Shield,
  AlertCircle
} from "lucide-react";

const MARKETPLACE_OWNER = "0xf29bbCFB987F3618515ddDe75D6CAd34cc1855D7";

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
      const currentAddress = await signer.getAddress();
      if (currentAddress.toLowerCase() !== MARKETPLACE_OWNER.toLowerCase()) {
        toast("You are not authorized to access this page.");
        router.push("/");
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
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar/>
      <div className="p-4 md:p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <LayoutDashboard className="w-8 h-8 text-pink-400" />
                  <div>
                    <h1 className="text-3xl font-bold text-slate-200">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage your NFT marketplace</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/admin/updatefees')}
                  className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Update Fees</span>
                </button>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400">Listing Fee</h3>
                    <Percent className="h-4 w-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{listingFee}%</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400">Royalty Fee</h3>
                    <Coins className="h-4 w-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{royaltyFee}%</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400">Total NFTs</h3>
                    <Package className="h-4 w-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{totalNFTs}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400">Market Cap</h3>
                    <TrendingUp className="h-4 w-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{marketCap} ETH</div>
                </div>
              </div>

              {/* Creators and Sales Data Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-pink-400" />
                    <h2 className="text-xl font-bold text-slate-200">Creators List</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Active NFT creators in the marketplace</p>
                  {creators.length > 0 ? (
                    <div className="space-y-4">
                      {creators.map((creator, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                          <div className="font-mono text-slate-300">
                            {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                          </div>
                          <div className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
                            {creator.nftCount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No creators found.</p>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart2 className="w-5 h-5 text-pink-400" />
                    <h2 className="text-xl font-bold text-slate-200">Sales Data</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Marketplace sales analytics</p>
                  <SalesChart data={salesData} />
                </div>
              </div>

              {/* Listed NFTs Section */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold text-slate-200">Listed NFTs</h2>
                </div>
                <p className="text-sm text-slate-400 mb-6">Currently listed NFTs in the marketplace</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <NFTCard key={index} item={item} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No NFTs listed at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-200 mb-2">Wallet Not Connected</h2>
              <p className="text-slate-400">Please connect your wallet to access the admin dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
