import dbConnect from "@/lib/dbConnect";
import Discussion from "@/models/Discussion";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();

        // Fetch all discussions from the database
        const discussions = await Discussion.find().sort({ createdAt: -1 });

        return NextResponse.json(discussions, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching discussions" }, { status: 500 });
    }
}
