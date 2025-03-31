"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"
import MarketplaceJson from "../marketplace.json"
import axios from "axios"

export default function TrendingCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL)
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        provider
      )

      const transaction = await contract.getAllListedNFTs()
      
      // Create a copy of the array
      const nftsArray = [...transaction]

      // Group NFTs by collection (using the first part of the name as collection name)
      const collectionMap = new Map()

      // Fetch metadata for all NFTs
      const nftData = await Promise.all(
        nftsArray.map(async (nft) => {
          const tokenId = parseInt(nft.tokenId)
          const tokenURI = await contract.tokenURI(tokenId)
          const { data: meta } = await axios.get(tokenURI)
          const price = ethers.formatEther(nft.price)

          // Extract collection name from NFT name (assuming format "Collection Name #123")
          const collectionName = meta.name.split('#')[0].trim()
          
          return {
            id: tokenId,
            name: meta.name,
            collectionName,
            price: parseFloat(price),
            image: meta.image,
            seller: nft.seller,
          }
        })
      )

      // Group NFTs by collection
      nftData.forEach(nft => {
        if (!collectionMap.has(nft.collectionName)) {
          collectionMap.set(nft.collectionName, {
            name: nft.collectionName,
            items: [],
            totalVolume: 0,
            uniqueOwners: new Set(),
          })
        }
        const collection = collectionMap.get(nft.collectionName)
        collection.items.push(nft)
        collection.totalVolume += nft.price
        collection.uniqueOwners.add(nft.seller)
      })

      // Convert map to array and sort by volume
      const sortedCollections = Array.from(collectionMap.values())
        .map(collection => ({
          id: collection.items[0].id,
          name: collection.name,
          creator: Array.from(collection.uniqueOwners)[0].slice(0, 6) + '...' + Array.from(collection.uniqueOwners)[0].slice(-4),
          floorPrice: Math.min(...collection.items.map(item => item.price)).toFixed(4) + ' ETH',
          volume: collection.totalVolume.toFixed(4) + ' ETH',
          change: '+' + (Math.random() * 30).toFixed(1) + '%', // Random change for now
          owners: collection.uniqueOwners.size,
          items: collection.items.length,
          image: collection.items[0].image,
          verified: true,
        }))
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, 4)

      setCollections(sortedCollections)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching collections:", error)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-40 bg-zinc-800 rounded-lg"></div>
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
    >
      {collections.map((collection) => (
        <motion.div key={collection.id} variants={item}>
          <Link href={`/nft/${collection.id}`} className="block group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-zinc-900 border-zinc-800">
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-pink-400/10 to-purple-500/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-zinc-900"
                  />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg truncate mr-1">{collection.name}</h3>
                    {collection.verified && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-pink-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-green-500 border-green-500/20 bg-green-500/10"
                  >
                    <ArrowUp className="h-3 w-3" />
                    {collection.change}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400 mb-4">by {collection.creator}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Floor Price</p>
                    <p className="font-semibold">{collection.floorPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Volume</p>
                    <p className="font-semibold">{collection.volume}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-zinc-400">
                  <Users className="h-3 w-3" />
                  <span>{collection.owners.toLocaleString()} owners</span>
                  <span className="mx-1">•</span>
                  <span>{collection.items.toLocaleString()} items</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

