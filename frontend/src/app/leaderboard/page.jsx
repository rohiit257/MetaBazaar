"use client";
import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import { WalletContext } from "@/context/wallet";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, ExternalLink, Loader2 } from "lucide-react";

export default function Leaderboard() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isConnected) {
      getCreators();
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-200 mb-2">Creator Leaderboard</h1>
            <p className="text-slate-400">Discover the top NFT creators in our community</p>
          </div>

          <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-200">Top Creators</CardTitle>
              <CardDescription className="text-slate-400">
                Rankings based on the number of NFTs created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-4 px-4 text-slate-400 font-medium">Rank</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium">Creator</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium">NFTs</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creators.map((creator, index) => (
                        <tr key={creator.address} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <Trophy className={`w-5 h-5 mr-2 ${
                                  index === 0 ? 'text-yellow-400' :
                                  index === 1 ? 'text-gray-400' :
                                  'text-amber-600'
                                }`} />
                              ) : (
                                <span className="w-5 h-5 mr-2 text-slate-400">{index + 1}</span>
                              )}
                              <span className="text-slate-200">{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Users className="w-5 h-5 mr-2 text-slate-400" />
                              <Link href={`/creator/${creator.address}`}>
                                <span className="text-slate-200 hover:text-pink-500 transition-colors">
                                  {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                                </span>
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-green-400 font-medium">{creator.nftCount}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Link href={`/creator/${creator.address}`}>
                              <Button variant="ghost" className="text-pink-500 hover:text-pink-600">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
