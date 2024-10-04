"use client";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import { WalletContext } from "@/context/wallet";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/components/Navbar";

export default function Marketplace() {
  const [items, setItems] = useState([]); // Initialize as an empty array
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return itemsArray; // Return an empty array if signer is not available

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
          const price = ethers.formatEther(i.price);

          const item = {
            price: parseFloat(price),
            tokenId,
            image: meta.image,
            name: meta.name,
            description: meta.description,
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
        setItems(itemsArray);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    if (isConnected) {
      fetchData(); // Fetch data only if connected
    }
  }, [isConnected]); // Dependency array includes isConnected

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              {/* Display NFTs in ShadCN Table */}
              {items.length > 0 ? (
                <Table>
                  <TableCaption>NFT Listings</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NFT</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price (ETH)</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.tokenId} className="h-24"> {/* Set row height */}
                        <TableCell className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded mr-4" // Increase image size
                          />
                        </TableCell>
                        <TableCell className="text-black">{item.name}</TableCell>
                        <TableCell className="text-black">{item.description}</TableCell>
                        <TableCell>{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <button
                            className="bg-sky-500 text-white py-1 px-2 rounded hover:bg-sky-600"
                            onClick={() => router.push(`/nft/${item.tokenId}`)} // Navigate to token details page
                          >
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-gray-500">
                  No NFTs available.
                </div>
              )}
            </>
          ) : (
            <div className="relative text-center text-slate-300 font-space-mono">
              <div className="absolute inset-0 flex items-center justify-center z-0"></div>
              <div className="relative z-10 font-bold">
                YOU ARE NOT CONNECTED TO YOUR WALLET
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
