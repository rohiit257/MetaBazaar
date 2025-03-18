"use client";

import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Carousel } from "../components/ui/carousel";
import MarketplaceJson from "../marketplace.json";
import { WalletContext } from "@/context/wallet";
import Link from "next/link";

export function CarouselDemo() {
  const [nfts, setNfts] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return [];

    const contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );

    try {
      const transaction = await contract.getAllListedNFTs();

      for (const i of transaction) {
        const tokenId = parseInt(i.tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        try {
          const { data: meta } = await axios.get(tokenURI);
          const item = {
            title: meta.name,
            src: meta.image, // NFT image
            button: (
              <Link href={`/nft/${tokenId}`} className="text-black font-mono">
                Explore
              </Link>
            ),
          };

          itemsArray.push(item);
        } catch (err) {
          console.error(
            `Error fetching metadata for tokenId ${tokenId}:`,
            err.response ? err.response.data : err.message
          );
        }
      }
    } catch (error) {
      console.error(
        "Error fetching NFT items:",
        error.response ? error.response.data : error.message
      );
    }
    return itemsArray;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsArray = await getNFTitems();
        setNfts(itemsArray);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected, signer]); // Re-fetch when the wallet connects

  return (
    <div className="relative w-full py-10 md:py-20 font-mono px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-6">
        Trending NFTs
      </h2>
      {nfts.length > 0 ? (
        <Carousel
          slides={nfts}
          options={{
            responsive: {
              // Adjust the number of slides shown based on screen size
              mobile: { breakpoint: { max: 640, min: 0 }, items: 1 },
              tablet: { breakpoint: { max: 1024, min: 640 }, items: 2 },
              desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
            },
          }}
        />
      ) : (
        <p className="text-center text-gray-500">
          {isConnected
            ? "No NFTs available. Check back later!"
            : "Connect Your Wallet To Explore Trending NFTs"}
        </p>
      )}
    </div>
  );
}