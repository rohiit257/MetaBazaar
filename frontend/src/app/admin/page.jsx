'use client'
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/NFTCard";
import SalesChart from "../components/SalesChart";
import AdminSidebar from "../components/AdminSidebar";
import { WalletContext } from "../../context/wallet";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Settings, 
  Coins, 
  ImageIcon, 
  Users, 
  BarChart2, 
  ArrowRight,
  DollarSign,
  Percent,
  Package,
  TrendingUp,
  Shield,
  AlertCircle,
  Menu
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/Navbar";

const MARKETPLACE_OWNER = "0xf29bbCFB987F3618515ddDe75D6CAd34cc1855D7";
const MARKETPLACE_ADDRESS = MarketplaceJson.address.trim();

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [listingFee, setListingFee] = useState("");
  const [royaltyFee, setRoyaltyFee] = useState("");
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [marketCap, setMarketCap] = useState(0);
  const [creators, setCreators] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

  useEffect(() => {
    const checkOwner = async () => {
      if (!signer) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        const currentAddress = await signer.getAddress();
        const isOwner = currentAddress.toLowerCase() === MARKETPLACE_OWNER.toLowerCase();
        setIsAdmin(isOwner);
        
        if (!isOwner) {
          toast.error("Access Denied: Only marketplace owner can access this page.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        toast.error("Error verifying admin access");
        router.push("/");
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkOwner();
  }, [signer, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!signer || !isConnected) return;

      try {
        setIsLoading(true);
        setError(null);

        // Initialize contract
        const contract = new ethers.Contract(
          MARKETPLACE_ADDRESS,
          MarketplaceJson.abi,
          signer
        );

        // Fetch all data in parallel for better performance
        const [
          listingFeeValue,
          royaltyFeeValue,
          nfts,
          auctions
        ] = await Promise.all([
          contract.getListingFeePercent(),
          contract.getRoyaltyPercent(),
          contract.getAllListedNFTs(),
          contract.getAuctionedNFTs()
        ]);

        // Format fees (convert from BigInt to string percentage)
        setListingFee(listingFeeValue.toString());
        setRoyaltyFee(royaltyFeeValue.toString());

        // Calculate total NFTs and market cap from NFTs data
        setTotalNFTs(nfts.length.toString());
        
        // Calculate market cap from NFTs (handle BigInt values)
        const totalValue = nfts.reduce((acc, nft) => {
          return acc + Number(ethers.formatEther(nft.price));
        }, 0);
        setMarketCap(totalValue.toFixed(5));

        // Fetch NFT metadata in parallel
        const nftData = await Promise.all(
          nfts.map(async (nft) => {
            try {
              const tokenURI = await contract.tokenURI(nft.tokenId);
              const metadata = await axios.get(tokenURI);
              return {
                ...nft,
                ...metadata.data,
                price: ethers.formatEther(nft.price),
                tokenId: nft.tokenId.toString(),
                creator: nft.creator,
                owner: nft.owner,
                seller: nft.seller,
                salesCount: nft.salesCount.toString(),
                lastTransactionTime: new Date(Number(nft.lastTransactionTime) * 1000).toLocaleString()
              };
            } catch (error) {
              console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, error);
              return {
                ...nft,
                name: "Unknown NFT",
                description: "Metadata unavailable",
                image: "/placeholder.png",
                price: ethers.formatEther(nft.price),
                tokenId: nft.tokenId.toString(),
                creator: nft.creator,
                owner: nft.owner,
                seller: nft.seller,
                salesCount: nft.salesCount.toString(),
                lastTransactionTime: new Date(Number(nft.lastTransactionTime) * 1000).toLocaleString()
              };
            }
          })
        );
        setItems(nftData);

        // Get unique creators from NFTs
        const uniqueCreators = [...new Set(nfts.map(nft => nft.creator))];
        
        // Calculate NFT counts for each creator
        const creatorsWithCount = uniqueCreators.map(creator => {
          const nftCount = nfts.filter(nft => nft.creator.toLowerCase() === creator.toLowerCase()).length;
          return {
            address: creator,
            nftCount: nftCount.toString(),
            displayAddress: `${creator.slice(0, 6)}...${creator.slice(-4)}`
          };
        });
        setCreators(creatorsWithCount);

        // Format sales data from price history (handle BigInt values)
        const salesData = nfts.map(nft => ({
          date: new Date(Number(nft.lastTransactionTime) * 1000).toLocaleDateString(),
          price: ethers.formatEther(nft.price),
          tokenId: nft.tokenId.toString(),
          salesCount: nft.salesCount.toString()
        }));
        setSalesData(salesData);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch marketplace data");
        toast.error("Error loading dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [signer, isConnected]);

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="bg-zinc-900/50 border-zinc-800 max-w-md w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-2xl font-bold text-slate-200 mb-4">Access Denied</h2>
              <p className="text-slate-400 text-center mb-6">
                Only the marketplace owner can access the admin dashboard.
              </p>
              <div className="bg-zinc-800/50 p-4 rounded-lg mb-6 w-full">
                <p className="text-sm text-slate-400 mb-2">Required Address:</p>
                <p className="font-mono text-pink-400 break-all">{MARKETPLACE_OWNER}</p>
              </div>
              <Button 
                onClick={() => router.push("/")}
                className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-slate-200 mb-2">Error Loading Data</h2>
              <p className="text-slate-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="bg-pink-500/20 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-200">Dashboard</h1>
                <p className="text-sm text-slate-400">Welcome back, Admin</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/admin/updatefees')}
              className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30"
            >
              <Settings className="w-4 h-4 mr-2" />
              Update Fees
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-pink-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Listing Fee</CardTitle>
                <Percent className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{listingFee}%</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-pink-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Royalty Fee</CardTitle>
                <Coins className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{royaltyFee}%</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-pink-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total NFTs</CardTitle>
                <Package className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{totalNFTs}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-pink-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Market Cap</CardTitle>
                <TrendingUp className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-200">{marketCap} ETH</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-pink-400" />
                  <span>Sales Analytics</span>
                </CardTitle>
                <CardDescription>Marketplace sales trends</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart data={salesData} />
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  <span>Top Creators</span>
                </CardTitle>
                <CardDescription>Most active NFT creators</CardDescription>
              </CardHeader>
              <CardContent>
                {creators.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-400">Address</TableHead>
                        <TableHead className="text-right text-slate-400">NFTs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creators.slice(0, 5).map((creator, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-slate-300">
                            {creator.displayAddress}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-pink-500/20 text-pink-400 hover:bg-pink-500/30">
                              {creator.nftCount}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No creators found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent NFTs Section */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-pink-400" />
                <span>Recent NFTs</span>
              </CardTitle>
              <CardDescription>Latest listed NFTs in the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.slice(0, 8).map((item, index) => (
                  <NFTCard key={index} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}