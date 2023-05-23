import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  shortDescription: String,
  description: String,
  category: String,
  tags: Array,
  sku: String,
  weight: String,
  dimensions: String,
  color: String,
  material: String,
  image: String,
  rating: Object,
  qty: Number,
});

export default productSchema;
