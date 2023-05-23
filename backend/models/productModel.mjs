import mongoose from "mongoose";
import productSchema from "../schemas/productSchema.mjs";

const Product = new mongoose.model("Product", productSchema);
export default Product;
