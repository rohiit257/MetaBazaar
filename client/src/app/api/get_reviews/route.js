// app/api/get_reviews/route.js
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    // Get tokenId from query parameters
    const url = new URL(request.url);
    const tokenId = url.searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    // Fetch reviews for the specific NFT
    const reviews = await Review.find({ tokenId }).sort({ createdAt: -1 });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Error fetching reviews" }, { status: 500 });
  }
}
