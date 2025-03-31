"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"
import MarketplaceJson from "../marketplace.json"
import axios from "axios"

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [featuredNFTs, setFeaturedNFTs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalNFTs: 0,
    totalArtists: 0,
    totalNFTsListed: 0
  })

  useEffect(() => {
    fetchRandomNFTs()
    fetchStats()
  }, [])

  const fetchRandomNFTs = async () => {
    try {
      const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL)
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        provider
      )

      const transaction = await contract.getAllListedNFTs()
      
      // Create a copy of the array and shuffle it
      const nftsArray = [...transaction]
      const shuffledNFTs = nftsArray.sort(() => Math.random() - 0.5)
      
      // Take 3 random NFTs
      const randomNFTs = shuffledNFTs.slice(0, 3)

      // Fetch metadata for each NFT
      const nftData = await Promise.all(
        randomNFTs.map(async (nft) => {
          const tokenId = parseInt(nft.tokenId)
          const tokenURI = await contract.tokenURI(tokenId)
          const { data: meta } = await axios.get(tokenURI)
          const price = ethers.formatEther(nft.price)

          return {
            id: tokenId,
            title: meta.name,
            creator: nft.seller.slice(0, 6) + '...' + nft.seller.slice(-4),
            price: `${parseFloat(price).toFixed(4)} ETH`,
            image: meta.image,
          }
        })
      )

      setFeaturedNFTs(nftData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching random NFTs:", error)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL)
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        provider
      )

      // Get all listed NFTs
      const nfts = await contract.getAllListedNFTs()
      
      // Get unique creators (artists) from NFTs
      const uniqueCreators = [...new Set(nfts.map(nft => nft.creator))]
      const totalArtists = uniqueCreators.length

      // Get total NFTs minted
      const totalNFTs = await contract._tokenIds()

      // Get total listed NFTs
      const totalNFTsListed = nfts.length

      setStats({
        totalNFTs: parseInt(totalNFTs),
        totalArtists,
        totalNFTsListed
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    if (featuredNFTs.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredNFTs.length)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [featuredNFTs.length])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-black py-12 md:py-24">
        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-black py-12 md:py-24">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 size-80 rounded-full bg-pink-400/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 size-80 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
        />
      </div>

      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block mb-4"
            >
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-pink-400/10 text-pink-400 hover:bg-pink-400/20">
                Decentralized NFT Marketplace
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            >
              Discover, Collect, and Sell{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                Extraordinary
              </span>{" "}
              NFTs
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-zinc-400 mb-8 max-w-lg"
            >
              The world's most innovative marketplace for unique digital assets. Connect with creators and collectors in
              a truly decentralized ecosystem.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/marketplace">
                <Button size="lg" className="sm:w-auto bg-pink-400 hover:bg-pink-500 text-white">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/mint">
                <Button
                  size="lg"
                  variant="outline"
                  className="sm:w-auto border-pink-400 text-pink-400 hover:bg-pink-400/10"
                >
                  Mint NFT
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex items-center gap-8"
            >
              <div>
                <p className="text-3xl font-bold">{stats.totalNFTs}</p>
                <p className="text-zinc-400">Artworks</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalArtists}</p>
                <p className="text-zinc-400">Artists</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalNFTsListed}</p>
                <p className="text-zinc-400">NFTs Listed</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {featuredNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: index === currentIndex ? 1 : 0,
                    scale: index === currentIndex ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative size-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-1">{nft.title}</h3>
                      <p className="text-white/80 mb-3">by {nft.creator}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-white font-semibold">{nft.price}</p>
                        <Link href={`/nft/${nft.id}`}>
                          <Button size="sm" variant="secondary" className="bg-pink-400 hover:bg-pink-500 text-white">
                            View NFT
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* NFT card floating animation */}
            <motion.div
              className="absolute -right-16 -top-8 size-40 rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-lg overflow-hidden hidden lg:block"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Image src="https://i.pinimg.com/736x/8a/e8/b2/8ae8b2bea99f311b04877cd5764f8876.jpg" alt="NFT Preview" fill className="object-cover" />
            </motion.div>

            <motion.div
              className="absolute -left-12 -bottom-8 size-32 rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-lg overflow-hidden hidden lg:block"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: 1,
              }}
            >
              <Image src="https://i.pinimg.com/736x/b9/3e/69/b93e692c821144e9b477e3f6f1ecbd30.jpg" alt="NFT Preview" fill className="object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

