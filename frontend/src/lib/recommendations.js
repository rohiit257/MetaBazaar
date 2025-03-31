import { ethers } from "ethers";
import marketplace from "../app/marketplace.json";
import axios from "axios";

// Cache for NFT metadata
const metadataCache = new Map();

// Helper function to fetch and cache NFT metadata
async function fetchNFTMetadata(tokenURI) {
  if (metadataCache.has(tokenURI)) {
    return metadataCache.get(tokenURI);
  }

  try {
    const response = await axios.get(tokenURI);
    const metadata = response.data;
    metadataCache.set(tokenURI, metadata);
    return metadata;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}

// Helper function to get text embedding using Hugging Face API
async function getTextEmbedding(text) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data[0];
  } catch (error) {
    console.error("Error getting text embedding:", error);
    return null;
  }
}

// Helper function to calculate cosine similarity between embeddings
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (norm1 * norm2);
}

// Helper function to calculate similarity between two NFTs
async function calculateSimilarity(nft1, nft2) {
  let score = 0;
  let weights = 0;

  // Price similarity (30% weight)
  if (nft1.price && nft2.price) {
    const priceDiff = Math.abs(parseFloat(nft1.price) - parseFloat(nft2.price));
    const maxPrice = Math.max(parseFloat(nft1.price), parseFloat(nft2.price));
    const priceScore = 1 - (priceDiff / maxPrice);
    score += priceScore * 0.3;
    weights += 0.3;
  }

  // Text similarity (70% weight) using Hugging Face embeddings
  if (nft1.name && nft2.name && nft1.description && nft2.description) {
    const text1 = `${nft1.name} ${nft1.description}`;
    const text2 = `${nft2.name} ${nft2.description}`;
    
    const embedding1 = await getTextEmbedding(text1);
    const embedding2 = await getTextEmbedding(text2);
    
    if (embedding1 && embedding2) {
      const textScore = cosineSimilarity(embedding1, embedding2);
      score += textScore * 0.7;
      weights += 0.7;
    }
  }

  // Normalize score based on available weights
  return weights > 0 ? score / weights : 0;
}

export async function getRecommendations(tokenId) {
  try {
    if (!tokenId) {
      console.error("Token ID is required");
      return { recommendations: [] };
    }

    // Get the browser provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      marketplace.address.trim(),
      marketplace.abi,
      provider
    );

    // Get all NFTs
    const allNFTs = await contract.getAllListedNFTs();
    if (!allNFTs || allNFTs.length === 0) {
      return { recommendations: [] };
    }
    
    // Find the current NFT
    const currentNFT = allNFTs.find(nft => nft && nft.tokenId && nft.tokenId.toString() === tokenId.toString());
    if (!currentNFT) {
      console.error("NFT not found");
      return { recommendations: [] };
    }

    // Get metadata for all NFTs
    const nftsWithMetadata = await Promise.all(
      allNFTs.map(async (nft) => {
        if (!nft || !nft.tokenId) return null;
        try {
          const tokenURI = await contract.tokenURI(nft.tokenId);
          const metadata = await fetchNFTMetadata(tokenURI);
          if (!metadata) return null;
          
          return {
            ...nft,
            name: metadata.name || `NFT #${nft.tokenId}`,
            description: metadata.description || "",
            image: metadata.image || "",
            price: ethers.formatEther(nft.price)
          };
        } catch (error) {
          console.error(`Error processing NFT ${nft.tokenId}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and calculate similarity scores
    const validNFTs = nftsWithMetadata.filter(nft => nft !== null);
    const similarityScores = await Promise.all(
      validNFTs
        .filter(nft => nft.tokenId && nft.tokenId.toString() !== tokenId.toString())
        .map(async (nft) => ({
          ...nft,
          similarity: await calculateSimilarity(currentNFT, nft)
        }))
    );

    // Sort by similarity and get top 4 recommendations
    const sortedScores = similarityScores.sort((a, b) => b.similarity - a.similarity);
    return {
      recommendations: sortedScores.slice(0, 4)
    };
  } catch (error) {
    console.error("Error in recommendations:", error);
    return {
      recommendations: []
    };
  }
} 