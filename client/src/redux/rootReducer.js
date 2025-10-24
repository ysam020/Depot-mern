import userReducer from "./features/users/users";
import productReducer from "./features/products/products";
import cartReducer from "./features/cart/cart";
import wishlistReducer from "./features/wishlist/wishlist";
import productDetailsReducer from "./features/productDetails/productDetails";
import { combineReducers } from "@reduxjs/toolkit";

export default combineReducers({
  users: userReducer,
  products: productReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  productDetails: productDetailsReducer,
});
