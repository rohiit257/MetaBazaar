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

export default function NFTPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const { isConnected, userAddress, signer } = useContext(WalletContext);
  const router = useRouter();

  // State for royalty
  const [royalty, setRoyalty] = useState(null);

  // Review state
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]); // To store all reviews for this NFT
  const [transactionHistory, setTransactionHistory] = useState([]);
  // Fetch NFT data
  async function getNFTData() {
    if (!signer || !tokenId) return;

    let contract = new ethers.Contract(
      MarketplaceJson.address,
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
      MarketplaceJson.address,
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
            timestamp: new Date((await tx.getBlock()).timestamp * 1000).toLocaleString(),
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

        listenForRoyaltyPaidEvent(); // Listen for royalty event
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

      let contract = new ethers.Contract(
        MarketplaceJson.address,
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
      // router.push("/");
    } catch (e) {
      console.error("Error in sellNFT:", e); // More detailed logging
      console.log(e);

      setMsg("Error buying NFT.");
      setBtnContent("Buy NFT");
    }
  }

  // Listen for the RoyaltyPaid event from the contract
  async function listenForRoyaltyPaidEvent() {
    if (!signer) return;

    const contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    contract.on("RoyaltyPaid", (creator, amount, tokenId) => {
      const amountInEth = ethers.formatEther(amount);
      setRoyalty({ creator, amount: amountInEth });
    });
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
    <div className="flex flex-col min-h-screen font-space-mono bg-zinc-950">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
        {isConnected ? (
          <div className="container mx-auto flex flex-col md:flex-row items-center m-7 p-7">
            <div className="flex-shrink-0">
              {item?.image ? (
                <Image
                  src={item.image}
                  alt={item.name || "NFT Image"}
                  width={450}
                  height={550}
                  className="rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-[520px] flex items-center justify-center text-gray-500">
                  Image not available
                </div>
              )}
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex flex-col md:w-1/2">
              <div className="text-gray-700">
                <h1 className="text-3xl font-semibold text-slate-300">
                  {item?.name || "Name not available"} #{item?.tokenId}
                </h1>
                <div className="my-4">
                  <p className="leading-relaxed text-gray-600">
                    {item?.description || "Description not available"}
                  </p>
                </div>
                <div className="my-4">
                  <p className="leading-relaxed text-gray-600">
                    Seller: {item?.seller || "Seller not available"}
                  </p>
                  <p className="leading-relaxed text-gray-600">
                    Creator: {item?.creator || "Owner not available"}
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-600">
                  {item?.price || "Price not available"} ETH
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="destructive">Check Transactions</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Transaction History</SheetTitle>
                      <SheetDescription>
                        Below are the transactions for this NFT.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 bg-black">
                      {transactionHistory.length > 0 ? (
                        transactionHistory.map((tx, index) => (
                          <div key={index} className="mt-2 border-b border-zinc-800 pb-2">
                            <p className="text-gray-500">
                              From: {tx.from} To: {tx.to}
                            </p>
                            <p className="text-slate-300">
                              Transaction Hash:{" "}
                              <a
                                href={`https://etherscan.io/tx/${tx.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-sky-300"
                              >
                                {tx.transactionHash}
                              </a>
                            </p>
                            <p className="text-gray-400">Timestamp: {tx.timestamp}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No transactions found for this NFT.</p>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                  <p className="mt-4 text-pink-400 font-semibold">
                    You already own this NFT.
                  </p>
                ) : (
                  <button
                    onClick={sellNFT}
                    className="mt-4 rounded-md bg-sky-300 px-4 py-2 text-black font-semibold shadow-sm hover:bg-sky-400"
                  >
                    {btnContent}
                  </button>
                )}

                {/* Royalty Info */}
                {royalty && (
                  <div className="mt-4 text-slate-300">
                    <p>
                      Royalty Paid to Creator: {royalty.amount} ETH (Creator:{" "}
                      {royalty.creator})
                    </p>
                  </div>
                )}

                {/* Review Form */}
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-slate-300">
                    Leave a Review
                  </h2>
                  <form onSubmit={submitReview} className="flex flex-col mt-4">
                    <textarea
                      className="p-2 border border-zinc-800 rounded-md text-slate-300 bg-black"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Write your review here"
                      required
                    />
                    <button
                      type="submit"
                      className="mt-4 rounded-md bg-sky-300 px-4 py-2 text-black font-semibold shadow-sm hover:bg-sky-400"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-300">
            You are not connected...
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-1 p-7 m-7">
        <h2 className="text-2xl font-semibold text-slate-300">Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((r, index) => (
            <div key={index} className="mt-4 border-t border-zinc-800 pt-4">
              <p className="text-gray-500">{r.userAddress}</p>
              <p className="text-slate-300">{r.review}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
