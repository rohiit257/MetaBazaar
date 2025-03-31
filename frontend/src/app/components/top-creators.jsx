"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ethers } from "ethers"
import MarketplaceJson from "../marketplace.json"
import axios from "axios"
import { Mail } from "lucide-react"

export default function TopCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopCreators()
  }, [])

  const fetchTopCreators = async () => {
    try {
      setError(null)
      const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL)
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        provider
      )

      const transaction = await contract.getAllListedNFTs()
      const nftsArray = [...transaction]

      // Group NFTs by seller and calculate total sales
      const creatorMap = new Map()

      // Fetch metadata for all NFTs
      const nftData = await Promise.all(
        nftsArray.map(async (nft) => {
          const tokenId = parseInt(nft.tokenId)
          const tokenURI = await contract.tokenURI(tokenId)
          const { data: meta } = await axios.get(tokenURI)
          const price = ethers.formatEther(nft.price)

          return {
            id: tokenId,
            name: meta.name,
            price: parseFloat(price),
            image: meta.image,
            seller: nft.seller,
          }
        })
      )

      // Group NFTs by seller
      nftData.forEach(nft => {
        if (!creatorMap.has(nft.seller)) {
          creatorMap.set(nft.seller, {
            address: nft.seller,
            totalSales: 0,
            nftCount: 0,
            nfts: [],
          })
        }
        const creator = creatorMap.get(nft.seller)
        creator.totalSales += nft.price
        creator.nftCount++
        creator.nfts.push(nft)
      })

      // Convert map to array and sort by total sales
      const sortedCreators = Array.from(creatorMap.values())
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 6)

      // Fetch user details from backend for each creator
      const creatorsWithDetails = await Promise.all(
        sortedCreators.map(async (creator) => {
          try {
            const response = await axios.get(`/api/get_user?userAddress=${creator.address}`)
            const userData = response.data

            // Log the user data to debug
            console.log('User data for address:', creator.address, userData)

            return {
              id: creator.address,
              name: userData.name || creator.address.slice(0, 6) + '...' + creator.address.slice(-4),
              userName: userData.userName || userData.username || creator.address.slice(0, 6) + '...' + creator.address.slice(-4),
              email: userData.email || 'No email provided',
              avatar: userData.avatar || creator.nfts[0].image || "/placeholder.svg",
              sales: creator.totalSales.toFixed(4) + ' ETH',
              followers: userData.followers || 0,
              verified: userData.verified || false,
            }
          } catch (error) {
            console.error(`Error fetching user details for ${creator.address}:`, error)
            // If user not found (404) or other error, use fallback data
            return {
              id: creator.address,
              name: creator.address.slice(0, 6) + '...' + creator.address.slice(-4),
              userName: creator.address.slice(0, 6) + '...' + creator.address.slice(-4),
              email: 'No email provided',
              avatar: creator.nfts[0].image || "/placeholder.svg",
              sales: creator.totalSales.toFixed(4) + ' ETH',
              followers: 0,
              verified: false,
            }
          }
        })
      )

      setCreators(creatorsWithDetails)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching creators:", error)
      setError("Failed to load creators. Please try again later.")
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-24 bg-zinc-800 rounded-lg"></div>
            <div className="p-4">
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={fetchTopCreators}
          className="mt-4 bg-pink-500 hover:bg-pink-600"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
    >
      {creators.map((creator) => (
        <motion.div key={creator.id} variants={item}>
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-pink-400/20">
                  <AvatarImage src={creator.avatar} alt={creator.userName} />
                  <AvatarFallback>{creator.userName}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-lg">{creator.name}</h3>
                    {creator.verified && (
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
                  <p className="text-sm text-zinc-400">@{creator.userName}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-zinc-400">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{creator.email}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-zinc-400">Total Sales</p>
                  <p className="font-semibold">{creator.sales}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Followers</p>
                  <p className="font-semibold">{creator.followers}K</p>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full border-pink-400 text-pink-400 hover:bg-pink-400/10">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

