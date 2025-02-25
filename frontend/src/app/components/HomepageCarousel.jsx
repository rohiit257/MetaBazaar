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
      MarketplaceJson.address,
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
              <Link href={`/nft/${tokenId}`} className="text-black font-mono ">
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
    <div className="relative w-full py-20 font-mono">
      <h2 className="text-4xl font-bold text-center text-white mb-6">
      </h2>
      {nfts.length > 0 ? (
        <Carousel slides={nfts} />
      ) : (
        <p className="text-center text-gray-500">Connect Your Wallet To Explore Trending NFT's</p>
      )}
    </div>
  );
}
