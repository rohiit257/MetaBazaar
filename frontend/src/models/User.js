import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userAddress: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevents model recompilation on hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
