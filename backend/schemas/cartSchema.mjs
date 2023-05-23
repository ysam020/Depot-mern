import mongoose from "mongoose";
import productSchema from "./productSchema.mjs";

const cartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  product: {
    type: [productSchema],
    default: [],
  },
});

export default cartSchema;
