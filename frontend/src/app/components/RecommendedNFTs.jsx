'use client';

import { useEffect, useState } from "react";
import { getRecommendations } from "@/lib/recommendations";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Coins } from "lucide-react";
import Image from "next/image";

export default function RecommendedNFTs({ tokenId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getRecommendations(tokenId);
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchRecommendations();
    }
  }, [tokenId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-zinc-900/50 border-zinc-800/50 animate-pulse">
            <CardHeader>
              <div className="h-4 bg-zinc-800/50 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800/50 mb-4"></div>
              <div className="h-4 bg-zinc-800/50 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-zinc-800/50 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No similar NFTs found at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((nft) => (
        <Card 
          key={nft.tokenId} 
          className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 hover:border-pink-500/30 transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => router.push(`/nft/${nft.tokenId}`)}
        >
          <CardContent className="p-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800/50 mb-4">
              {nft.image ? (
                <Image
                  src={nft.image}
                  alt={nft.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">{nft.name}</h3>
            <p className="text-sm text-slate-400 mb-2">#{nft.tokenId}</p>
            <div className="flex items-center justify-between">
              <span className="text-pink-400 font-medium flex items-center">
                <Coins className="w-4 h-4 mr-1" />
                {nft.price} ETH
              </span>
              {nft.category && (
                <span className="text-xs text-slate-500 bg-zinc-800/50 px-2 py-1 rounded-full">
                  {nft.category}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 