"use client";
import { WalletContext } from "@/context/wallet";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import GetIpfsUrlFromPinata from "@/app/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

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

      setBtnContent("Processing...");
      setMsg("Buying the NFT... Please Wait (Up to 5 mins)");

      let transaction = await contract.sellNFT(tokenId, { value: salePrice });

      await transaction.wait();

      alert("You successfully bought the NFT!");
      setMsg("");
      setBtnContent("Buy NFT");
      // Optionally navigate back to the marketplace or home page
      // router.push("/");
    } catch (e) {
      console.error("Error in sellNFT:", e);
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
    <div className="min-h-screen p-8">
      <Navbar />
      {item ? (
        <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
          <Image
            src={item.image}
            alt={item.name}
            width={300} // Set width of the image
            height={300} // Set height of the image
            className="rounded-lg mb-4"
          />
          <p className="text-gray-700 mb-2">{item.description}</p>
          <p className="text-gray-700 mb-2"><strong>Seller:</strong> {item.seller}</p>
          <p className="text-gray-700 mb-2"><strong>Creator:</strong> {item.creator}</p>
          <p className="text-gray-700 mb-2"><strong>Price:</strong> {item.price} ETH</p>
          <Button
            onClick={sellNFT}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {btnContent}
          </Button>
          {msg && <p className="mt-4 text-red-500">{msg}</p>}

          {/* Review Submission Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-2">Submit a Review</h2>
            <form onSubmit={submitReview} className="flex flex-col">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="border border-gray-300 p-2 rounded mb-2"
                placeholder="Write your review here..."
                required
              />
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Submit Review
              </Button>
            </form>
            {msg && <p className="mt-4 text-red-500">{msg}</p>}
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-2">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review, index) => (
                  <li key={index} className="p-4 border border-gray-200 rounded shadow-sm">
                    <p className="text-gray-700">{review.review}</p>
                    <p className="text-sm text-gray-500">Reviewed by: {review.userAddress}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-500">Loading NFT details...</p>
        </div>
      )}
    </div>
  );
}
