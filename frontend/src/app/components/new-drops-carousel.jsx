"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import Image from "next/image"
import { ethers } from "ethers"
import MarketplaceJson from "../marketplace.json"
import axios from "axios"

export default function NewDropsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const timeoutRef = useRef(null)
  const [newDrops, setNewDrops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewDrops()
  }, [])

  const fetchNewDrops = async () => {
    try {
      const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL)
      const contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        provider
      )

      const transaction = await contract.getAllListedNFTs()
      
      // Create a copy of the array before sorting
      const nftsArray = [...transaction]
      
      // Sort by dateListed to get the most recent ones
      const sortedNFTs = nftsArray.sort((a, b) => {
        return b.dateListed - a.dateListed
      })

      // Take the last 3 NFTs (most recent ones)
      const latestNFTs = sortedNFTs.slice(-3).reverse() // Get last 3 and reverse to show oldest first

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
            description: meta.description,
            image: meta.image,
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            price: `${parseFloat(price).toFixed(4)} ETH`,
          }
        })
      )

      setNewDrops(nftData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching new drops:", error)
      setLoading(false)
    }
  }

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
  }

  const paginate = (newDirection) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + newDirection
      if (newIndex < 0) return newDrops.length - 1
      if (newIndex >= newDrops.length) return 0
      return newIndex
    })
  }

  useEffect(() => {
    if (newDrops.length > 0) {
      resetTimeout()
      timeoutRef.current = setTimeout(() => {
        paginate(1)
      }, 6000)

      return () => {
        resetTimeout()
      }
    }
  }, [currentIndex, newDrops])

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const formatTimeLeft = (endTime) => {
    const end = new Date(endTime).getTime()
    const now = new Date().getTime()
    const distance = end - now

    if (distance < 0) return "Ended"

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return `${days}d ${hours}h left`
  }

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-black">
        <div className="h-[500px] md:h-[600px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>

      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <Image
                src={newDrops[currentIndex]?.image || "/placeholder.svg"}
                alt={newDrops[currentIndex]?.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-20 flex items-center justify-between px-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/50 border-zinc-700 text-white hover:bg-black/70"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/50 border-zinc-700 text-white hover:bg-black/70"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              key={`content-${currentIndex}`}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-pink-400/20 px-2.5 py-0.5 text-xs font-semibold text-pink-400">
                      NEW DROP
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-zinc-300">
                      <Clock className="h-3 w-3 text-pink-400" />
                      {formatTimeLeft(newDrops[currentIndex]?.endTime)}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{newDrops[currentIndex]?.title}</h1>
                  <p className="text-zinc-300 mb-2">
                    by <span className="text-pink-400">{newDrops[currentIndex]?.creator}</span>
                  </p>
                  <p className="text-zinc-400 max-w-xl mb-4 hidden md:block">{newDrops[currentIndex]?.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-1"></p>
                    <p className="text-xl font-bold">{newDrops[currentIndex]?.price}</p>
                  </div>
                  <Button className="bg-pink-400 hover:bg-pink-500 text-white">View Collection</Button>
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {newDrops.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      currentIndex === index ? "w-8 bg-pink-400" : "w-2 bg-zinc-600"
                    }`}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1)
                      setCurrentIndex(index)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

