'use client'
import { useContext, useEffect, useState } from "react";
import { ethers, formatEther } from "ethers";  // Import formatEther directly
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
import { WalletContext } from "@/context/wallet";

export default function Profile() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(""); 
  const [totalAmount, setTotalAmount] = useState(0); 
  const [totalRoyalties, setTotalRoyalties] = useState(0); // State for total royalties
  const [profilePic, setProfilePic] = useState(""); // State for profile picture
  const { isConnected, signer } = useContext(WalletContext);

  async function getMyNFTs() {
    const itemsArray = [];
    let totalAmount = 0; 

    if (!signer) return;

    const contract = new ethers.Contract(
      MarketplaceJson.address,
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
          const price = formatEther(i.price);  // Updated to use formatEther directly

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

          // Set profile picture to the first NFT's image
          if (itemsArray.length === 1) {
            setProfilePic(item.image);
          }
        } catch (err) {
          console.error(`Error fetching metadata for tokenId ${tokenId}:`, err.response ? err.response.data : err.message);
        }
      }

      const userAddress = await signer.getAddress();
      setUserId(userAddress);
      setTotalAmount(totalAmount);

      // Fetch total royalties earned
      const royalties = await contract.totalRoyaltiesEarned(userAddress);
      setTotalRoyalties(parseFloat(formatEther(royalties)));  // Updated to use formatEther directly

    } catch (error) {
      console.error("Error fetching NFT items:", error.response ? error.response.data : error.message);
    }

    return itemsArray;
  }

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
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto lg:grid lg:grid-cols-2 lg:gap-8">
          {/* User Info Card on the Left */}
          <div className="bg-zinc-900 overflow-hidden shadow rounded-lg text-slate-300 mb-8 lg:mb-0 lg:col-span-1">
            <div className="px-4 py-5 sm:px-6 text-slate-300 font-space-mono flex items-center">
              <div className="flex justify-center items-center w-32 h-32 bg-zinc-800 rounded-full overflow-hidden mr-6">
                {profilePic ? (
                  <img src={profilePic} alt="Profile Picture" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-slate-300">
                  User Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  This is some information about the user.
                </p>
                <dl className="mt-4">
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
                      {totalAmount.toFixed(2)} ETH
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Total Royalties Earned
                    </dt>
                    <dd className="mt-1 text-sm text-slate-300 sm:mt-0 sm:col-span-2">
                      {totalRoyalties.toFixed(2)} ETH
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Owned NFTs Section on the Right */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-300 mb-4">Owned NFTs</h2>
            {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
