import mongoose, { connection, connections } from "mongoose";

async function dbConnect() {
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI)
        console.log(
            `\n MongoDB connected !! DB HOST: ${db.connection.host}`
          );
    } catch(error) {
        console.log("MONGODB connection FAILED",error);
        process.exit(1)
    }
}

export default dbConnect