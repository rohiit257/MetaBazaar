"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers, formatEther } from "ethers";
import marketplace from "./../marketplace.json";
import { WalletContext } from "@/context/wallet";
import Navbar from "../components/Navbar";
import { FlipWords } from "../components/ui/flip-words";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Wallet, RefreshCw, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TRADE() {
  const [formParams, updateFormParams] = useState({
    userId: "",
    nftTokenId: "",
  });
  const [message, updateMessage] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnContent, setBtnContent] = useState("TRADE NFT");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isConnected, signer, userAddress } = useContext(WalletContext);

  async function getMyNFTs() {
    const itemsArray = [];

    if (!signer) return;

    const contract = new ethers.Contract(
      marketplace.address.trim(),
      marketplace.abi,
      signer
    );

    try {
      setIsLoading(true);
      const transaction = await contract.getMyNFTs();

      for (const i of transaction) {
        const tokenId = parseInt(i.tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        try {
          const { data: meta } = await axios.get(tokenURI);
          const price = formatEther(i.price);

          const item = {
            price: parseFloat(price),
            tokenId,
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            dateListed: i.dateListed,
          };

          itemsArray.push(item);
        } catch (error) {
          console.error(`Error fetching metadata for tokenId ${tokenId}:`, error.response ? error.response.data : error.message);
        }
      }

      setItems(itemsArray);
    } catch (error) {
      console.error("Error fetching NFT items:", error.response ? error.response.data : error.message);
      toast.error("Failed to fetch your NFTs");
    } finally {
      setIsLoading(false);
    }

    return itemsArray;
  }

  useEffect(() => {
    if (isConnected && signer) {
      getMyNFTs();
    }
  }, [isConnected, signer]);

  async function tradeNFT(e) {
    e.preventDefault();

    const { userId, nftTokenId } = formParams;
    if (!userId || !nftTokenId) {
      updateMessage("Please fill all the fields!");
      return;
    }

    try {
      setBtnContent("Processing...");
      setLoading(true);

      let contract = new ethers.Contract(
        marketplace.address.trim(),
        marketplace.abi,
        signer
      );

      let transaction = await contract.tradeNFT(userId, nftTokenId);
      await transaction.wait();

      setBtnContent("TRADE NFT");
      setBtnDisabled(false);
      setLoading(false);
      updateMessage("");
      updateFormParams({ userId: "", nftTokenId: "" });
      toast.success("Successfully traded the NFT!");
      router.push("/marketplace");
    } catch (e) {
      toast.error("Trade error: " + e.message);
      console.error("Error trading NFT:", e);
      setBtnContent("TRADE NFT");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {isConnected ? (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-200 mb-2">Trade NFTs</h1>
              <p className="text-slate-400">Exchange NFTs with other creators in the community</p>
            </div>

            <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-slate-200">Trade Your NFT</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter the details below to start trading your NFT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={tradeNFT} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Recipient Address</Label>
                      <div className="relative">
                        <Input
                          className="bg-zinc-800 border-zinc-700 text-slate-200 pl-10"
                          type="text"
                          placeholder="Enter recipient's wallet address"
                          value={formParams.userId}
                          onChange={(e) =>
                            updateFormParams({ ...formParams, userId: e.target.value })
                          }
                        />
                        <Wallet className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">Select NFT to Trade</Label>
                      <Select
                        value={formParams.nftTokenId}
                        onValueChange={(value) =>
                          updateFormParams({ ...formParams, nftTokenId: value })
                        }
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-slate-200">
                          <SelectValue placeholder="Select an NFT" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {items.map((item) => (
                            <SelectItem
                              key={item.tokenId}
                              value={item.tokenId.toString()}
                              className="text-slate-300 hover:bg-zinc-800"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-slate-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-slate-400">#{item.tokenId}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {message && (
                    <div className="text-sm text-red-400">{message}</div>
                  )}

                  <Button 
                    type="submit"
                    disabled={btnDisabled || isLoading}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Trade NFT
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-zinc-900/50 backdrop-blur-lg border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-200">Connect Your Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Please connect your wallet to start trading NFTs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
