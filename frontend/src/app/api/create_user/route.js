import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();

    const { userAddress, userName, email } = await request.json();

    if (!userAddress || !userName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by address
    let user = await User.findOne({ userAddress });

    if (user) {
      // Update existing user
      user.userName = userName;
      user.email = email;
    } else {
      // Create new user if not found
      user = new User({ userAddress, userName, email });
    }

    await user.save();

    return NextResponse.json(user, { status: 200 }); // Send updated user
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating user profile" }, { status: 500 });
  }
}
