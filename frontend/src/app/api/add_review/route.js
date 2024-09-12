import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();

    const { tokenId, userAddress, review } = await request.json();

    if (!tokenId || !userAddress || !review) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReview = new Review({
      tokenId,
      userAddress,
      review,
      createdAt: new Date(),
    });

    console.log(newReview);

    await newReview.save();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error adding review" }, { status: 500 });
  }
}
