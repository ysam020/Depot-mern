import mongoose from "mongoose";
import addressSchema from "../schemas/addressSchema.mjs";

const Address = new mongoose.model("Address", addressSchema);

export default Address;
