import mongoose from "mongoose";
import cartSchema from "../schemas/cartSchema.mjs";

const Cart = new mongoose.model("Cart", cartSchema);
export default Cart;
