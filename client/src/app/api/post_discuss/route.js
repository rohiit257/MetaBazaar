import dbConnect from "@/lib/dbConnect";
import Discussion from "@/models/Discussion";
import { NextResponse } from "next/server";

export async function POST(request){
    try {
        await dbConnect()

        const {author,content} =  await request.json()

        if(!author || !content){
            return NextResponse.json({error : "Missing Required Fields"},{status:400})
        }

        const discussion = new Discussion({
            author,
            content,
            createdAt : new Date(),
        })

        console.log(discussion);
        await discussion.save()

        return NextResponse.json(discussion,{status:200})
    

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error adding Discussion" }, { status: 500 });
        
    }
}

