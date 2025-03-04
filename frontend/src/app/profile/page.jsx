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

          if (itemsArray.length === 1) {
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
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {/* User Info Card */}
          <div className="bg-zinc-900 overflow-hidden shadow rounded-lg text-slate-300 mb-8 mx-auto max-w-2xl">
            <div className="px-4 py-6 text-slate-300 font-space-mono flex flex-col items-center">
              <div className="flex justify-center items-center w-40 h-40 bg-zinc-800 rounded-full overflow-hidden mb-6">
                {profilePic ? (
                  <img src={profilePic} alt="Profile Picture" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="text-lg leading-6 font-medium text-slate-300">
                {username}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {email}
              </p>
              <dl className="mt-4 w-full">
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    User ID
                  </dt>
                  <dd className="mt-1 text-sm text-slate-300 sm:mt-0 sm:col-span-2">
                    {userId}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Total NFTs
                  </dt>
                  <dd className="mt-1 text-sm text-slate-300 sm:mt-0 sm:col-span-2">
                    {items.length}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-sm text-slate-300 sm:mt-0 sm:col-span-2">
                    {totalAmount.toFixed(5)} ETH
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Royalties Earned
                  </dt>
                  <dd className="mt-1 text-sm text-slate-300 sm:mt-0 sm:col-span-2">
                    {totalRoyalties.toFixed(15)} ETH
                  </dd>
                </div>
              </dl>

              {/* Buttons Row */}
              <div className="flex space-x-4 mt-6">
                <Link href="/mint">
                  <button className="bg-sky-300 hover:bg-sky-400 text-white py-2 px-4 rounded-md">
                    Mint
                  </button>
                </Link>
                <Link href="/leaderboard">
                  <button className="bg-pink-300 hover:bg-pink-400 text-white py-2 px-4 rounded-md">
                    Leaderboard
                  </button>
                </Link>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Dialog Modal */}
          {isDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-black dark:bg-black p-6 rounded-lg shadow-lg w-96 font-mono">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Update Profile
                </h2>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Username
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Owned NFTs Section */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-300 mb-4 text-center">Owned NFTs</h2>
            {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items.map((value, index) => (
                  <NFTCard item={value} key={index} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FlipWords words={["Fetching", "User Data", ".", "..", "..."]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
