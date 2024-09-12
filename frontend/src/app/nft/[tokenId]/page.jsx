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

export default function NFTPage() {
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const { isConnected, userAddress, signer } = useContext(WalletContext);
  const router = useRouter();

  // Review state
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]); // To store all reviews for this NFT

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

  useEffect(() => {
    async function fetchData() {
      if (!isConnected || !signer) return;

      try {
        const itemTemp = await getNFTData();
        setItem(itemTemp);
        await fetchReviews(); // Fetch reviews after fetching the NFT data
      } catch (error) {
        setItem(null);
      }
    }

    fetchData();
  }, [isConnected, signer]);

  // Handle buying NFT
  async function buyNFT() {
    try {
      if (!signer || !item) return;

      let contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const salePrice = ethers.parseUnits(item.price, "ether");
      setBtnContent("Processing...");
      setMsg("Buying the NFT... Please Wait (Up to 5 mins)");

      if (typeof contract.sellNFT !== 'function') {
        throw new Error("sellNFT function is not available in the contract.");
      }

      let transaction = await contract.sellNFT(tokenId, { value: salePrice });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      setMsg("");
      setBtnContent("Buy NFT");
      router.push("/");
    } catch (e) {
      setMsg("Error buying NFT.");
      setBtnContent("Buy NFT");
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
    <div className="flex flex-col min-h-screen font-space-mono ">
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
                <div className="w-full h-[520px] flex items-center justify-center text-gray-500">Image not available</div>
              )}
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex flex-col md:w-1/2">
              <div className="text-gray-700">
                <h1 className="text-3xl font-semibold text-slate-300">{item?.name || "Name not available"} #{item?.tokenId}</h1>
                <div className="my-4">
                  <p className="leading-relaxed text-gray-600">{item?.description || "Description not available"}</p>
                </div>
                <p className="text-xl font-bold text-gray-600">{item?.price || "Price not available"} ETH</p>

                {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                  <p className="mt-4 text-pink-400 font-semibold">You already own this NFT.</p>
                ) : (
                  <button
                    onClick={buyNFT}
                    className="mt-4 rounded-md bg-sky-300 px-4 py-2 text-black font-semibold shadow-sm hover:bg-sky-400"
                  >
                    {btnContent}
                  </button>
                )}

                {/* Review Form */}
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-slate-300">Leave a Review</h2>
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
          <div className="text-center text-slate-300">You are not connected...</div>
        )}
      </div>
      {/* Reviews Section */}
      <div className="mt-8 p-7 m-7">
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
