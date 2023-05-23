import mongoose from "mongoose";
import wishlistSchema from "../schemas/wishlistSchema.mjs";

const Wishlist = new mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
