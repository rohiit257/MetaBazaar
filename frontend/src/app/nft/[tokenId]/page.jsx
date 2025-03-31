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
import { Hash, Coins, User, Star, MessageSquare, BarChart2, History, ArrowRight, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

      const listedToken = await contract.getNFTListing(tokenId);

      const item = {
        price: ethers.formatEther(listedToken.price),
        tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
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
          return {
            from,
            to,
            tokenId,
            transactionHash: tx.hash,
            timestamp: new Date(
              (await tx.getBlock()).timestamp * 1000
            ).toLocaleString(),
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
        await fetchReviews(); // Fetch reviews after fetching the NFT data
        await fetchTransactionHistory(); // Fetch transaction history
        await fetchPriceHistory();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar />
      <div className="p-4 md:p-8">
        {isConnected ? (
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* NFT Image Section */}
              <div className="relative group">
                <div className="rounded-xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 hover:border-pink-500/50 transition-all duration-300 shadow-lg hover:shadow-pink-500/20">
                  {item?.image ? (
                    <Image
                      src={item.image}
                      alt={item.name || "NFT Image"}
                      width={600}
                      height={700}
                      className="w-full h-[500px] md:h-[600px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center text-gray-500">
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
              <div className="space-y-6">
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 shadow-lg">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-200 mb-4">
                    {item?.name || "Name not available"} #{item?.tokenId}
                  </h1>
                  <p className="text-slate-400 mb-6">
                    {item?.description || "Description not available"}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Seller</p>
                        <p className="text-slate-300">{item?.seller || "Seller not available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Creator</p>
                        <p className="text-slate-300">{item?.creator || "Creator not available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-pink-400" />
                      <div>
                        <p className="text-sm text-slate-500">Price</p>
                        <p className="text-2xl font-bold text-pink-400">
                          {item?.price || "Price not available"} ETH
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-4">
                    {/* Analytics Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-zinc-800/50 hover:bg-zinc-800/80 text-slate-300 border-zinc-700/50">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full sm:w-[95vw] lg:w-[90vw] xl:w-[85vw] max-w-[1400px] bg-zinc-900/95 backdrop-blur-sm border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <BarChart2 className="w-5 h-5 text-pink-400" />
                            <span>Price Analytics</span>
                          </DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Detailed price history and market analytics for this NFT
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-8 space-y-8">
                          {/* Price Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <DollarSign className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-slate-500">Current Price</span>
                              </div>
                              <p className="text-2xl font-bold text-slate-200">{item?.price || "0"} ETH</p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-slate-500">Price Change</span>
                              </div>
                              <p className="text-2xl font-bold text-slate-200">
                                {priceHistory.length > 1 
                                  ? `${((parseFloat(item?.price) - parseFloat(priceHistory[0].amount)) / parseFloat(priceHistory[0].amount) * 100).toFixed(2)}%`
                                  : "0%"}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-slate-500">Transactions</span>
                              </div>
                              <p className="text-2xl font-bold text-slate-200">{transactionHistory.length}</p>
                            </div>
                          </div>

                          {/* Price Chart */}
                          <div className="h-[500px] w-full bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                            {priceHistory.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={priceHistory}>
                                  <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                  <XAxis 
                                    dataKey="date" 
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af' }}
                                  />
                                  <YAxis 
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af' }}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#18181b',
                                      border: '1px solid #27272a',
                                      borderRadius: '0.5rem',
                                      color: '#e5e7eb'
                                    }}
                                    labelStyle={{ color: '#9ca3af' }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#ec4899"
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <p className="text-slate-400">No price history available.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Transaction History Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-zinc-800/50 hover:bg-zinc-800/80 text-slate-300 border-zinc-700/50">
                          <History className="w-4 h-4 mr-2" />
                          Transaction History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full sm:w-[95vw] lg:w-[90vw] xl:w-[85vw] max-w-[1400px] bg-zinc-900/95 backdrop-blur-sm border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <History className="w-5 h-5 text-pink-400" />
                            <span>Transaction History</span>
                          </DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Complete history of all transactions for this NFT
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-8 space-y-6">
                          {/* Transaction Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <Hash className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-slate-500">Total Transactions</span>
                              </div>
                              <p className="text-2xl font-bold text-slate-200">{transactionHistory.length}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-slate-500">First Transaction</span>
                              </div>
                              <p className="text-lg font-medium text-slate-200">
                                {transactionHistory.length > 0 ? transactionHistory[transactionHistory.length - 1].timestamp : "N/A"}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-slate-500">Last Transaction</span>
                              </div>
                              <p className="text-lg font-medium text-slate-200">
                                {transactionHistory.length > 0 ? transactionHistory[0].timestamp : "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Transaction List */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                            {transactionHistory.length > 0 ? (
                              transactionHistory.map((tx, index) => (
                                <div key={index} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/50 transition-colors duration-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Hash className="w-4 h-4 text-slate-500" />
                                      <p className="text-slate-300">
                                        From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                                      </p>
                                    </div>
                                    <p className="text-slate-500 text-sm">{tx.timestamp}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <ArrowRight className="w-4 h-4 text-pink-400" />
                                    <p className="text-slate-300">
                                      To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                                    </p>
                                  </div>
                                  <a
                                    href={`https://etherscan.io/tx/${tx.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center text-sm text-pink-400 hover:text-pink-300"
                                  >
                                    View on Etherscan
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                  </a>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-slate-400">No transactions found.</p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                      <p className="text-center text-pink-400 font-medium">
                        You already own this NFT
                      </p>
                    ) : (
                      <button
                        onClick={sellNFT}
                        className="w-full py-3 px-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            <span>Buy NFT</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-200 flex items-center space-x-2">
                      <MessageSquare className="w-6 h-6 text-pink-400" />
                      <span>Reviews</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-pink-400" />
                      <span className="text-slate-300">{reviews.length} Reviews</span>
                    </div>
                  </div>
                  
                  <form onSubmit={submitReview} className="mb-8">
                    <div className="relative">
                      <textarea
                        className="w-full p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200 min-h-[120px]"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this NFT..."
                        rows="4"
                      />
                      <button
                        type="submit"
                        className="absolute bottom-4 right-4 py-2 px-4 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                      >
                        <Star className="w-4 h-4" />
                        <span>Submit Review</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((r, index) => (
                          <div key={index} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/50 transition-colors duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                  <User className="w-4 h-4 text-pink-400" />
                                </div>
                                <div>
                                  <p className="text-slate-200 font-medium">{r.userAddress.slice(0, 6)}...{r.userAddress.slice(-4)}</p>
                                  <p className="text-sm text-slate-500">Verified Owner</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-pink-400 fill-current" />
                                <span className="text-slate-300">5.0</span>
                              </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{r.review}</p>
                            <div className="mt-3 flex items-center space-x-2 text-sm text-slate-500">
                              <Calendar className="w-4 h-4" />
                              <span>Just now</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No reviews yet. Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">Please connect your wallet to view NFT details.</p>
          </div>
        )}
      </div>
    </div>
  );
}