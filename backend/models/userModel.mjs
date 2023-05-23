import userSchema from "../schemas/userSchema.mjs";
import mongoose from "mongoose";

const User = new mongoose.model("User", userSchema);

export default User;
