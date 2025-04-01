"use client";
import { WalletContext } from "@/context/wallet";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import GetIpfsUrlFromPinata from "@/app/utils";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import SalesChart from "../../components/PriceHistoryChart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import PriceHistoryChart from "../../components/PriceHistoryChart";
import { Hash, Coins, User, Star, MessageSquare, BarChart2, History, ArrowRight, TrendingUp, DollarSign, Calendar, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import RecommendedNFTs from "@/app/components/RecommendedNFTs";

// Add these helper functions before the NFTPage component
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // Convert to lowercase and split into words
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  // Create sets of words
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  // Calculate Jaccard similarity
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

async function getSimilarNFTs(currentTokenId, contract) {
  try {
    // Get all listed NFTs
    const allNFTs = await contract.getAllListedNFTs();
    
    // Get current NFT data
    const currentNFT = allNFTs.find(nft => nft.tokenId.toString() === currentTokenId.toString());
    if (!currentNFT) return [];
    
    const currentTokenURI = await contract.tokenURI(currentTokenId);
    const currentMetaResponse = await axios.get(GetIpfsUrlFromPinata(currentTokenURI));
    const currentMeta = currentMetaResponse.data;
    
    // Get metadata for all NFTs
    const nftsWithMetadata = await Promise.all(
      allNFTs
        .filter(nft => nft.tokenId.toString() !== currentTokenId.toString())
        .map(async (nft) => {
          try {
            const tokenURI = await contract.tokenURI(nft.tokenId);
            const metaResponse = await axios.get(GetIpfsUrlFromPinata(tokenURI));
            const meta = metaResponse.data;
            
            // Calculate similarity score
            const titleSimilarity = calculateTextSimilarity(currentMeta.name, meta.name);
            const descSimilarity = calculateTextSimilarity(currentMeta.description, meta.description);
            const totalSimilarity = (titleSimilarity * 0.6) + (descSimilarity * 0.4);
            
            return {
              ...nft,
              name: meta.name,
              description: meta.description,
              image: meta.image,
              price: ethers.formatEther(nft.price),
              similarity: totalSimilarity
            };
          } catch (error) {
            console.error(`Error processing NFT ${nft.tokenId}:`, error);
            return null;
          }
        })
    );
    
    // Filter out null values and sort by similarity
    return nftsWithMetadata
      .filter(nft => nft !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4);
  } catch (error) {
    console.error("Error getting similar NFTs:", error);
    return [];
  }
}

export default function NFTPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const [loading, setLoading] = useState(false);
  const { isConnected, userAddress, signer, userName } = useContext(WalletContext);
  const router = useRouter();

  // State for royalty
  const [royalty, setRoyalty] = useState(null);

  // Review state
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]); // To store all reviews for this NFT
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [similarNFTs, setSimilarNFTs] = useState([]);

  // Fetch NFT data
  async function getNFTData() {
    if (!signer || !tokenId) return;

    let contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );

    try {
      let tokenURI = await contract.tokenURI(tokenId);
      tokenURI = GetIpfsUrlFromPinata(tokenURI);

      const metaResponse = await axios.get(tokenURI);
      const meta = metaResponse.data;

      // Get the NFT listing data
      const listedToken = await contract.getNFTListing(tokenId);
      
      // Get the actual current owner using ownerOf
      const currentOwner = await contract.ownerOf(tokenId);

      // Get transaction history to find latest transfer
      const filter = contract.filters.Transfer(null, null, tokenId);
      const events = await contract.queryFilter(filter);
      
      // Sort events by block number (descending) to get the most recent transfer
      events.sort((a, b) => b.blockNumber - a.blockNumber);
      
      // The most recent transfer's recipient is the actual current owner
      const mostRecentTransfer = events.length > 0 ? events[0] : null;
      const actualCurrentOwner = mostRecentTransfer ? mostRecentTransfer.args.to : currentOwner;

      const item = {
        price: ethers.formatEther(listedToken.price),
        tokenId,
        seller: actualCurrentOwner, // Use the actual current owner from recent transfers
        owner: currentOwner,
        creator: listedToken.creator,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };
      return item;
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      return null;
    }
  }

  // Fetch NFT price history
  async function fetchPriceHistory() {
    if (!signer) return;

    let contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );

    try {
      const prices = await contract.getPriceHistory(tokenId); // Fetch price history
      const timestamps = await fetchTransactionTimestamps(); // Fetch timestamps separately

      // Format the price history with timestamps
      const formattedHistory = prices.map((price, index) => ({
        date: timestamps[index] || "Unknown",
        amount: ethers.formatEther(price), // Convert from Wei to ETH
      }));

      setPriceHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  }

  // Fetch transaction timestamps
  async function fetchTransactionTimestamps() {
    let contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );

    try {
      const filter = contract.filters.Transfer(null, null, tokenId);
      const events = await contract.queryFilter(filter);

      return await Promise.all(
        events.map(async (event) => {
          const block = await event.getBlock();
          return new Date(block.timestamp * 1000).toLocaleDateString(); // Format as readable date
        })
      );
    } catch (error) {
      console.error("Error fetching timestamps:", error);
      return [];
    }
  }

  // Fetch reviews for the NFT
  async function fetchReviews() {
    try {
      const response = await axios.get(`/api/get_reviews?tokenId=${tokenId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async function fetchTransactionHistory() {
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address.trim(),
      MarketplaceJson.abi,
      signer
    );
    try {
      const filter = contract.filters.Transfer(null, null, tokenId);
      const events = await contract.queryFilter(filter);
      const transactions = await Promise.all(
        events.map(async (event) => {
          const { from, to, tokenId } = event.args;
          const tx = await event.getTransaction();
          const block = await tx.getBlock();
          return {
            from,
            to,
            tokenId,
            transactionHash: tx.hash,
            timestamp: new Date(block.timestamp * 1000).toLocaleString(),
            amount: tx.value || "0" // Use transaction value or default to "0"
          };
        })
      );
      setTransactionHistory(transactions);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!isConnected || !signer) return;

      try {
        const itemTemp = await getNFTData();
        setItem(itemTemp);
        await fetchReviews();
        await fetchTransactionHistory();
        await fetchPriceHistory();
        
        // Get similar NFTs
        const contract = new ethers.Contract(
          MarketplaceJson.address.trim(),
          MarketplaceJson.abi,
          signer
        );
        const similar = await getSimilarNFTs(tokenId, contract);
        setSimilarNFTs(similar);
      } catch (error) {
        setItem(null);
      }
    }

    fetchData();
  }, [isConnected, signer]);

  // Handle buying NFT
  async function sellNFT() {
    try {
      if (!signer || !item) return;

      setLoading(true);
      let contract = new ethers.Contract(
        MarketplaceJson.address.trim(),
        MarketplaceJson.abi,
        signer
      );
      const salePrice = ethers.parseUnits(item.price, "ether");
      console.log(salePrice);

      setBtnContent("Processing...");
      setMsg("Buying the NFT... Please Wait (Up to 5 mins)");

      let transaction = await contract.sellNFT(tokenId, { value: salePrice });
      console.log(transaction);

      await transaction.wait();

      toast("You successfully bought the NFT!");
      setMsg("");
      setBtnContent("Buy NFT");
    } catch (e) {
      console.error("Error in sellNFT:", e);
      console.log(e);

      setMsg("Error buying NFT.");
      setBtnContent("Buy NFT");
    } finally {
      setLoading(false);
    }
  }

  // Handle review submission
  async function submitReview(e) {
    e.preventDefault();

    try {
      const response = await axios.post("/api/add_review", {
        tokenId,
        userAddress,
        review,
      });
      setReview(""); // Clear the review input
      setMsg("Review submitted successfully!");
      fetchReviews(); // Fetch updated reviews
    } catch (error) {
      setMsg("Error submitting review.");
    }
  }

  // Add a refresh function to manually update the data
  const refreshData = async () => {
    if (!isConnected || !signer) {
      toast.error("Please connect your wallet");
      return;
    }
    
    try {
      toast("Refreshing NFT data...");
      setLoading(true);
      
      const refreshedItem = await getNFTData();
      setItem(refreshedItem);
      await fetchTransactionHistory();
      await fetchPriceHistory();
      
      toast.success("NFT data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh NFT data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar />
      <div className="p-2 sm:p-4 md:p-8">
        {isConnected ? (
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* NFT Image Section */}
              <div className="relative group">
                <div className="rounded-xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 hover:border-pink-500/50 transition-all duration-300 shadow-lg hover:shadow-pink-500/20">
                  {item?.image ? (
                    <Image
                      src={item.image}
                      alt={item.name || "NFT Image"}
                      width={600}
                      height={700}
                      className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center text-gray-500">
                      Image not available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
              </div>

              {/* NFT Details Section */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 md:p-6 shadow-lg">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-200 mb-2 md:mb-4">
                    {item?.name || "Name not available"} #{item?.tokenId}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-400 mb-4 md:mb-6">
                    {item?.description || "Description not available"}
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                        <div>
                          <p className="text-xs sm:text-sm text-slate-500">Current Owner</p>
                          <p className="text-sm sm:text-base text-slate-300">{item?.seller || "Owner not available"}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="text-xs px-2 py-1 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 text-slate-300"
                        onClick={refreshData}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <ArrowRight className="w-3 h-3 mr-1" />
                        )}
                        Refresh
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500">Creator</p>
                        <p className="text-sm sm:text-base text-slate-300">{item?.creator || "Creator not available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500">Price</p>
                        <p className="text-xl sm:text-2xl font-bold text-pink-400">
                          {item?.price || "Price not available"} ETH
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                    <div className="flex flex-wrap gap-2 md:gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="text-xs sm:text-sm bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 text-slate-300"
                          >
                            <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            View Analytics
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900/95 border-zinc-800 sm:max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <BarChart2 className="w-5 h-5 text-pink-400" />
                              <span>Price Analytics</span>
                            </DialogTitle>
                            <DialogDescription>Detailed price history and market data</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            {/* Price Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-slate-400">Current Price</CardTitle>
                                  <DollarSign className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold text-slate-200">{item?.price || "0"} ETH</div>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-slate-400">Price Change</CardTitle>
                                  <TrendingUp className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold text-slate-200">
                                    {priceHistory.length > 1 
                                      ? `${((parseFloat(item?.price) - parseFloat(priceHistory[0].amount)) / parseFloat(priceHistory[0].amount) * 100).toFixed(2)}%`
                                      : "0%"}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-slate-400">Total Transactions</CardTitle>
                                  <ArrowRight className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold text-slate-200">{transactionHistory.length}</div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Price Chart */}
                            <div className="h-[300px] sm:h-[350px] w-full overflow-x-auto">
                              <div className="min-w-[600px]">
                                <AreaChart
                                  width={Math.max(600, window.innerWidth * 0.9)}
                                  height={350}
                                  data={priceHistory}
                                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                  <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                  />
                                  <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8' }}
                                  />
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#18181b', 
                                      border: '1px solid #27272a',
                                      borderRadius: '0.5rem',
                                      color: '#e2e8f0'
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#ec4899"
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                  />
                                </AreaChart>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="text-xs sm:text-sm bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 text-slate-300"
                          >
                            <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Transaction History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900/95 border-zinc-800 sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <History className="w-5 h-5 text-pink-400" />
                              <span>Transaction History</span>
                            </DialogTitle>
                            <DialogDescription>Complete history of all transactions</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            {/* Transaction Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-slate-400">Total Transactions</CardTitle>
                                  <ArrowRight className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold text-slate-200">{transactionHistory.length}</div>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-slate-400">First Transaction</CardTitle>
                                  <Calendar className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold text-slate-200">
                                    {transactionHistory.length > 0 ? transactionHistory[transactionHistory.length - 1].timestamp : "N/A"}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card className="bg-zinc-900/50 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-slate-400">Last Transaction</CardTitle>
                                  <Clock className="h-4 w-4 text-pink-400" />
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold text-slate-200">
                                    {transactionHistory.length > 0 ? transactionHistory[0].timestamp : "N/A"}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Transaction List */}
                            <div className="space-y-3">
                              {transactionHistory.length > 0 ? (
                                transactionHistory.map((tx, index) => (
                                  <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <CardContent className="p-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                            <ArrowRight className="w-4 h-4 text-pink-400" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-slate-200">
                                              From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                                            </p>
                                            <p className="text-sm text-slate-400">To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}</p>
                                          </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                          <p className="font-medium text-slate-200">
                                            {ethers.formatEther(tx.amount || "0")} ETH
                                          </p>
                                          <p className="text-sm text-slate-400">
                                            {tx.timestamp}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <p className="text-center text-slate-400">No transactions found.</p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                      <p className="text-center text-sm sm:text-base text-pink-400 font-medium">
                        You already own this NFT
                      </p>
                    ) : (
                      <button
                        onClick={sellNFT}
                        className="w-full py-2 sm:py-3 px-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Buy NFT</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-200 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                      <span>Reviews</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      <span className="text-sm sm:text-base text-slate-300">{reviews.length} Reviews</span>
                    </div>
                  </div>
                  
                  <form onSubmit={submitReview} className="mb-6 md:mb-8">
                    <div className="relative">
                      <textarea
                        className="w-full p-3 sm:p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this NFT..."
                        rows="4"
                      />
                      <button
                        type="submit"
                        className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2 text-xs sm:text-sm"
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Submit Review</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3 md:space-y-4">
                    {reviews.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {reviews.map((r, index) => (
                          <div key={index} className="p-3 sm:p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/50 transition-colors duration-200">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                                </div>
                                <div>
                                  <p className="text-sm sm:text-base text-slate-200 font-medium">{r.userAddress.slice(0, 6)}...{r.userAddress.slice(-4)}</p>
                                  <p className="text-xs sm:text-sm text-slate-500">Verified Owner</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400 fill-current" />
                                <span className="text-sm sm:text-base text-slate-300">5.0</span>
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{r.review}</p>
                            <div className="mt-2 md:mt-3 flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Just now</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 md:py-8">
                        <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3 md:mb-4" />
                        <p className="text-sm sm:text-base text-slate-400">No reviews yet. Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Similar NFTs Section */}
            <div className="mt-8 md:mt-12">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                    <span>You might also like</span>
                  </h2>
                </div>
                {similarNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {similarNFTs.map((nft) => (
                      <Card 
                        key={nft.tokenId} 
                        className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 hover:border-pink-500/30 transition-all duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => router.push(`/nft/${nft.tokenId}`)}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800/50 mb-3 md:mb-4">
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
                          <h3 className="text-sm sm:text-base font-semibold text-slate-200 mb-1">{nft.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-400 mb-2">#{nft.tokenId}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base text-pink-400 font-medium flex items-center">
                              <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {nft.price} ETH
                            </span>
                            <span className="text-xs text-slate-500 bg-zinc-800/50 px-2 py-1 rounded-full">
                              {Math.round(nft.similarity * 100)}% similar
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <p className="text-sm sm:text-base text-slate-400">No similar NFTs found at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm sm:text-base text-slate-400">Please connect your wallet to view NFT details.</p>
          </div>
        )}
      </div>
    </div>
  );
}