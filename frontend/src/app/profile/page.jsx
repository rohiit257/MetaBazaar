'use client'
import { useContext, useEffect, useState } from "react";
import { ethers, formatEther } from "ethers";  
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "@/app/components/NFTCard";
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
import { WalletContext } from "@/context/wallet";
import Link from "next/link";
import { toast } from "sonner";
import { User, Coins, Image as ImageIcon, Trophy, Edit2, Plus, Medal, Gavel, Timer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash } from "lucide-react";


export default function Profile() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(""); 
  const [totalAmount, setTotalAmount] = useState(0); 
  const [totalRoyalties, setTotalRoyalties] = useState(0); 
  const [profilePic, setProfilePic] = useState(""); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for modal visibility
  const { isConnected, signer } = useContext(WalletContext);
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [duration, setDuration] = useState("");
  const [auctionLoading, setAuctionLoading] = useState(false);

  async function getMyNFTs() {
    const itemsArray = [];
    let totalAmount = 0; 

    if (!signer) return;

    const contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );

    try {
      const transaction = await contract.getMyNFTs();

      for (const i of transaction) {
        const tokenId = parseInt(i.tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        try {
          const { data: meta } = await axios.get(tokenURI);
          const price = formatEther(i.price);  

          const item = {
            price: parseFloat(price),
            tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            dateListed: i.dateListed,
          };

          itemsArray.push(item);
          totalAmount += parseFloat(price);

          if (itemsArray.length === 2) {
            setProfilePic(item.image);
          }
        } catch (error) {
          console.error(`Error fetching metadata for tokenId ${tokenId}:`, error.response ? error.response.data : error.message);
        }
      }

      const userAddress = await signer.getAddress();
      setUserId(userAddress);
      setTotalAmount(totalAmount);

      // const royalties = await contract.totalRoyaltiesEarned(userAddress);
      // setTotalRoyalties(parseFloat(formatEther(royalties)));  

    } catch (error) {
      console.error("Error fetching NFT items:", error.response ? error.response.data : error.message);
    }

    return itemsArray;
  }
  const handleSave = async () => {
    
    try {
      const userAddress = await signer.getAddress(); // Retrieve address from WalletContext
  
      const response = await axios.post("/api/create_user", {
        userAddress, // Address from wallet
        userName: username,
        email,
      });  
      if (response.status === 200) {
        console.log("Profile updated successfully:", response.data);
        
      } else {
        console.error("Failed to update profile:", response.data);
      }
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response ? error.response.data : error.message
      )
    }
    setIsDialogOpen(false);
  };

  const fetchUserData = async () => {
    if (!isConnected || !signer) return;
  
    try {
      const userAddress = await signer.getAddress();
  
      const response = await axios.get(`/api/get_user?userAddress=${userAddress}`);
  
      if (response.status === 200) {
        const userData = response.data;
        setUsername(userData.userName);
        setEmail(userData.email);
      } else {
        console.error("User not found:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.response ? error.response.data : error.message);
    }
  };

  const startAuction = async () => {
    if (!signer || !selectedTokenId || !duration) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setAuctionLoading(true);
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.auctionNFT(selectedTokenId, duration);
      await tx.wait();
      toast.success("Auction started successfully!");
      setIsAuctionDialogOpen(false);
      // Refresh NFTs after auction
      const itemsArray = await getMyNFTs();
      setItems(itemsArray);
    } catch (error) {
      console.error("Error starting auction:", error);
      toast.error("Error starting auction: " + error.message);
    } finally {
      setAuctionLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsArray = await getMyNFTs();
        setItems(itemsArray);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
    fetchUserData()
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navbar />
      <div className="p-4 md:p-8">
        <div className="container mx-auto">
          {/* User Info Card */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 shadow-xl mb-12 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden bg-zinc-800/50 border-2 border-zinc-700/50 group-hover:border-pink-500/50 transition-all duration-300 shadow-lg">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile Picture"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                  <User className="w-6 h-6 text-pink-400" />
                  <h3 className="text-3xl font-bold text-slate-200">
                    {username || "Anonymous"}
                  </h3>
                </div>
                <p className="text-slate-400 mb-8 text-lg">{email || "No email provided"}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/30 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <ImageIcon className="w-5 h-5 text-pink-400" />
                      <span className="text-sm text-slate-400">NFTs</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-200">{items.length}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/30 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="w-5 h-5 text-pink-400" />
                      <span className="text-sm text-slate-400">Total Value</span>
                    </div>
                    <p className="text-2xl font-bold text-pink-400">{totalAmount.toFixed(5)} ETH</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/30 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <Medal className="w-5 h-5 text-pink-400" />
                      <span className="text-sm text-slate-400">Royalties</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-200">{totalRoyalties.toFixed(15)} ETH</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/30 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-pink-400" />
                      <span className="text-sm text-slate-400">Rank</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-200">#{userId.slice(0, 6)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                  <Link href="/mint">
                    <button className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all duration-300 hover:scale-105">
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">Mint NFT</span>
                    </button>
                  </Link>
                  <Link href="/leaderboard">
                    <button className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all duration-300 hover:scale-105">
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium">Leaderboard</span>
                    </button>
                  </Link>
                  <button
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all duration-300 hover:scale-105"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Edit2 className="w-5 h-5" />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                  <button
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all duration-300 hover:scale-105"
                    onClick={() => setIsAuctionDialogOpen(true)}
                  >
                    <Gavel className="w-5 h-5" />
                    <span className="font-medium">Auction NFT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Modals */}
          {isDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-2xl shadow-2xl w-11/12 sm:w-96 transform hover:scale-[1.02] transition-all duration-300">
                <h2 className="text-2xl font-bold text-slate-200 mb-8 flex items-center space-x-3">
                  <Edit2 className="w-6 h-6 text-pink-400" />
                  <span>Update Profile</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      className="px-6 py-3 rounded-xl bg-zinc-800/50 text-slate-300 hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-6 py-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all duration-300 hover:scale-105"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auction Dialog */}
          {isAuctionDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-2xl shadow-2xl w-11/12 sm:w-96 transform hover:scale-[1.02] transition-all duration-300">
                <h2 className="text-2xl font-bold text-slate-200 mb-8 flex items-center space-x-3">
                  <Gavel className="w-6 h-6 text-pink-400" />
                  <span>Start NFT Auction</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-3">
                      <Hash className="w-5 h-5 text-pink-400" />
                      <span>Select NFT</span>
                    </label>
                    <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
                      <SelectTrigger className="w-full p-4 rounded-xl bg-zinc-800/50 border-zinc-700/50 text-slate-300">
                        <SelectValue placeholder="Select an NFT" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {items.map((item) => (
                          <SelectItem 
                            key={item.tokenId} 
                            value={item.tokenId.toString()}
                            className="text-slate-300 hover:bg-zinc-800"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-slate-400">#{item.tokenId}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-3">
                      <Timer className="w-5 h-5 text-pink-400" />
                      <span>Auction Duration (seconds)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter duration in seconds (e.g., 86400 for 24 hours)"
                      className="w-full p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      className="px-6 py-3 rounded-xl bg-zinc-800/50 text-slate-300 hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105"
                      onClick={() => setIsAuctionDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-6 py-3 rounded-xl bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
                      onClick={startAuction}
                      disabled={auctionLoading}
                    >
                      {auctionLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                          <span className="font-medium">Starting Auction...</span>
                        </>
                      ) : (
                        <>
                          <Gavel className="w-5 h-5" />
                          <span className="font-medium">Start Auction</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Owned NFTs Section */}
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-200 mb-8 flex items-center space-x-3">
              <ImageIcon className="w-7 h-7 text-pink-400" />
              <span>Owned NFTs</span>
            </h2>
            {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((value, index) => (
                  <NFTCard item={value} key={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-slate-400 text-lg mb-4">
                  <FlipWords words={["Loading", "Your NFTs", ".", "..", "..."]} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
