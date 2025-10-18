import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import loginRoute from "./routes/post/login.mjs";
import registerRoute from "./routes/post/register.mjs";
import productRoute from "./routes/get/getProducts.mjs";
import productDetailsRoute from "./routes/get/getProductDetails.mjs";
import addToCartRoute from "./routes/post/addToCart.mjs";
import getCartRoute from "./routes/get/getCart.mjs";
import deleteFromCartRoute from "./routes/delete/deleteFromCart.mjs";
import updateCartRoute from "./routes/put/updateCart.mjs";
import addToWishlist from "./routes/post/addToWishlist.mjs";
import getWishlistRoute from "./routes/get/getWishlist.mjs";
import deleteFromWishlistRoute from "./routes/delete/deleteFromWishlist.mjs";
import addAddressRoute from "./routes/post/addAddress.mjs";
import getAddressRoute from "./routes/get/getAddress.mjs";
import deleteAddressRoute from "./routes/delete/deleteAddress.mjs";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend origin
    credentials: true, // allow cookies, tokens, etc.
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Login
app.use(loginRoute);

// Register
app.use(registerRoute);

// Get products
app.use(productRoute);

// Get single product
app.use(productDetailsRoute);

// Add product to cart
app.use(addToCartRoute);

// Get cart state from db
app.use(getCartRoute);

// Delete product from cart
app.use(deleteFromCartRoute);

// Update product quantity in cart
app.use(updateCartRoute);

// Add product to wishlist
app.use(addToWishlist);

// Get wishlist state from db
app.use(getWishlistRoute);

// Delete product from wishlist
app.use(deleteFromWishlistRoute);

// // Add address to db
// app.use(addAddressRoute);

// // Get address from db
// app.use(getAddressRoute);

// // Delete address from db
// app.use(deleteAddressRoute);

app.listen(9002, () => {
  console.log("BE started at port 9002");
});
