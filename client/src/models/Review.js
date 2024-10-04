import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,   // The ID of the NFT
  },
  userAddress: {
    type: String,
    required: true,   // The user's wallet address
  },
  review: {
    type: String,
    required: true,   // The review text
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp when the review was added
  }
});

// Check if the model already exists to avoid model overwrite errors
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
