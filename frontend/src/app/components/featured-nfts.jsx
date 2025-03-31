"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"
import MarketplaceJson from "../marketplace.json"
import axios from "axios"

export default function FeaturedNFTs() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    try {
      const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL)
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        provider
      )

      const transaction = await contract.getAllListedNFTs()
      
      // Create a copy of the array and sort by dateListed
      const nftsArray = [...transaction]
      const sortedNFTs = nftsArray.sort((a, b) => {
        return b.dateListed - a.dateListed
      })

      // Take the first 4 NFTs (most recent ones)
      const latestNFTs = sortedNFTs.slice(0, 4)

      // Fetch metadata for each NFT
      const nftData = await Promise.all(
        latestNFTs.map(async (nft) => {
          const tokenId = parseInt(nft.tokenId)
          const tokenURI = await contract.tokenURI(tokenId)
          const { data: meta } = await axios.get(tokenURI)
          const price = ethers.formatEther(nft.price)

          return {
            id: tokenId,
            title: meta.name,
            creator: nft.seller.slice(0, 6) + '...' + nft.seller.slice(-4),
            price: `${parseFloat(price).toFixed(4)} ETH`,
            likes: Math.floor(Math.random() * 200) + 50, // Random likes for now
            image: meta.image,
          }
        })
      )

      setNfts(nftData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
      setLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-zinc-800 rounded-lg"></div>
            <div className="p-4">
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
    >
      {nfts.map((nft) => (
        <motion.div key={nft.id} variants={item}>
          <Link href="#" className="block group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-zinc-900 border-zinc-800">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg truncate">{nft.title}</h3>
                    <p className="text-sm text-zinc-400">by {nft.creator}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-pink-400 hover:bg-transparent"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Like</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400">Current Price</p>
                  <p className="font-semibold">{nft.price}</p>
                </div>
                <Link href={`/nft/${nft.id}`}>
                  <Button size="sm" className="bg-pink-400 hover:bg-pink-500 text-white">
                    Browse
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

