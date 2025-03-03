"use client";
import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import { WalletContext } from "@/context/wallet";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Leaderboard() {
  const [creators, setCreators] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);

  // Function to fetch creators and their number of NFTs
  async function getCreators() {
    const creatorsMap = new Map();
    if (!signer) return;

    const contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );

    try {
      const transaction = await contract.getAllListedNFTs();

      for (const nft of transaction) {
        const creator = nft.seller; // Assuming 'seller' is the creator's address
        if (creatorsMap.has(creator)) {
          creatorsMap.set(creator, creatorsMap.get(creator) + 1);
        } else {
          creatorsMap.set(creator, 1); // Initialize creator's count
        }
      }
      
      // Convert the Map to an array of objects for easier sorting
      const creatorsArray = Array.from(creatorsMap, ([address, nftCount]) => ({
        address,
        nftCount,
      }));
      
      // Sort creators by NFT count in descending order
      creatorsArray.sort((a, b) => b.nftCount - a.nftCount);

      setCreators(creatorsArray);
    } catch (error) {
      console.error("Error fetching creators:", error.response ? error.response.data : error.message);
    }
  }

  useEffect(() => {
    if (isConnected) {
      getCreators();
    }
  }, [isConnected]);

  return (
    <>
    <Navbar/>

<div className="p-4 ">
      <section className="mx-auto w-full max-w-7xl px-2 py-4 font-space-mono">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold">Leaderboard</h2>
            <p className="mt-1 text-sm text-gray-700">
              View the top creators based on the number of NFTs they have created or own.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col ">
          <div className="-mx-2 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-black md:rounded-lg">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Rank</th>
                      <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Creator Address</th>
                      <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Number of NFTs</th>
                      <th className="px-4 py-3.5 text-left text-base font-normal text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className=" divide-zinc-800 bg-black">
                    {creators.map((creator, index) => (
                      <tr key={creator.address}>
                        {/* Rank column */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-300">
                          {index + 1}
                        </td>

                        {/* Address column */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <Link href={`/creator/${creator.address}`}>
                            <span className="text-sm font-semibold text-slate-300 hover:text-pink-400 cursor-pointer">
                              {creator.address}
                            </span>
                          </Link>
                        </td>

                        {/* Number of NFTs column */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="text-sm font-semibold text-green-400">
                            {creator.nftCount}
                          </span>
                        </td>

                        {/* Actions column */}
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                          <Link href={`/creator/${creator.address}`}>
                            <span className="text-pink-400 hover:text-slate-300">View Profile</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    </>
   
  );
}
