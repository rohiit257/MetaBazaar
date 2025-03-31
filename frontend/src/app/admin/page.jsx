'use client'
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import axios from "axios";
import NFTCard from "../components/NFTCard";
import SalesChart from "../components/SalesChart";
import { WalletContext } from "../../context/wallet";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Navbar from "../components/Navbar";
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
  AlertCircle
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

const MARKETPLACE_OWNER = "0xf29bbCFB987F3618515ddDe75D6CAd34cc1855D7";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [listingFee, setListingFee] = useState("");
  const [royaltyFee, setRoyaltyFee] = useState("");
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [marketCap, setMarketCap] = useState(0);
  const [creators, setCreators] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const { isConnected, signer } = useContext(WalletContext);
  const router = useRouter();

  useEffect(() => {
    const checkOwner = async () => {
      if (!signer) return;
      const currentAddress = await signer.getAddress();
      if (currentAddress.toLowerCase() !== MARKETPLACE_OWNER.toLowerCase()) {
        toast("You are not authorized to access this page.");
        router.push("/");
      }
    };

    checkOwner();
  }, [signer, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const itemsArray = [];
      const creatorsMap = new Map();
      let totalNFTs = 0;
      let marketCap = 0;
      const salesArray = [];

      if (!signer) return;

      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );

      try {
        // Fetch current listing fee and royalty fee
        const listingFeePercent = await contract.getListingFeePercent();
        const royaltyPercent = await contract.getRoyaltyPercent();
        setListingFee(ethers.formatEther(listingFeePercent));
        setRoyaltyFee(ethers.formatEther(royaltyPercent));

        // Fetch all listed NFTs and creators
        const transaction = await contract.getAllListedNFTs();
        totalNFTs = transaction.length;

        for (const nft of transaction) {
          const tokenId = parseInt(nft.tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const { data: meta } = await axios.get(tokenURI);
          const price = ethers.formatEther(nft.price);

          const item = {
            price: parseFloat(price),
            tokenId,
            seller: nft.seller,
            owner: nft.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
          itemsArray.push(item);

          // Collect creator data
          const creator = nft.seller; // Assuming 'seller' is the creator's address
          if (creatorsMap.has(creator)) {
            creatorsMap.set(creator, creatorsMap.get(creator) + 1);
          } else {
            creatorsMap.set(creator, 1); // Initialize creator's count
          }

          marketCap += parseFloat(price); // Calculate market cap

          // Prepare sales data
          salesArray.push({
            date: new Date().toLocaleDateString(), // Placeholder: use actual date if available
            amount: parseFloat(price),
          });
        }

        // Convert creators map to array of objects
        const creatorsArray = Array.from(creatorsMap, ([address, nftCount]) => ({
          address,
          nftCount,
        }));

        setItems(itemsArray);
        setCreators(creatorsArray);
        setTotalNFTs(totalNFTs);
        setMarketCap(marketCap.toFixed(2));
        setSalesData(salesArray);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, [signer]);

  // Function to update listing fee
  const updateListingFee = async () => {
    try {
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateListingFeePercent(ethers.parseEther(newListingFee));
      await tx.wait();
      alert("Listing fee updated successfully");
      setListingFee(newListingFee);
      setNewListingFee("");
    } catch (error) {
      console.error("Error updating listing fee:", error);
    }
  };

  // Function to update royalty fee
  const updateRoyaltyFee = async () => {
    try {
      const contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const tx = await contract.updateRoyaltyPercent(ethers.parseEther(newRoyaltyFee));
      await tx.wait();
      alert("Royalty fee updated successfully");
      setRoyaltyFee(newRoyaltyFee);
      setNewRoyaltyFee("");
    } catch (error) {
      console.error("Error updating royalty fee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      <Navbar/>
      <div className="p-4 md:p-8">
        <div className="container mx-auto">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <LayoutDashboard className="w-8 h-8 text-pink-400" />
                  <div>
                    <h1 className="text-3xl font-bold text-slate-200">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage your NFT marketplace</p>
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

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Listing Fee</CardTitle>
                    <Percent className="h-4 w-4 text-pink-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-200">{listingFee}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Royalty Fee</CardTitle>
                    <Coins className="h-4 w-4 text-pink-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-200">{royaltyFee}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total NFTs</CardTitle>
                    <Package className="h-4 w-4 text-pink-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-200">{totalNFTs}</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Market Cap</CardTitle>
                    <TrendingUp className="h-4 w-4 text-pink-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-200">{marketCap} ETH</div>
                  </CardContent>
                </Card>
              </div>

              {/* Creators and Sales Data Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-pink-400" />
                      <span>Creators List</span>
                    </CardTitle>
                    <CardDescription>Active NFT creators in the marketplace</CardDescription>
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
                          {creators.map((creator, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-slate-300">
                                {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
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

                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart2 className="w-5 h-5 text-pink-400" />
                      <span>Sales Data</span>
                    </CardTitle>
                    <CardDescription>Marketplace sales analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SalesChart data={salesData} />
                  </CardContent>
                </Card>
              </div>

              {/* Listed NFTs Section */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    <span>Listed NFTs</span>
                  </CardTitle>
                  <CardDescription>Currently listed NFTs in the marketplace</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <NFTCard key={index} item={item} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No NFTs listed at the moment.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-slate-200 mb-2">Wallet Not Connected</h2>
                <p className="text-slate-400">Please connect your wallet to access the admin dashboard.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
