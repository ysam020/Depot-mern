import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  address: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    town: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
  },
});

addressSchema.index(
  {
    email: 1,
    "address.name": 1,
    "address.email": 1,
    "address.addressLine1": 1,
    "address.town": 1,
    "address.zip": 1,
    "address.state": 1,
  },
  { unique: true }
);

export default addressSchema;
