import userReducer from "./features/users/users";
import productReducer from "./features/products/products";
import cartReducer from "./features/cart/cart";
import wishlistReducer from "./features/wishlist/wishlist";
import productDetailsReducer from "./features/productDetails/productDetails";
import addressReducer from "./features/address/address";
import { combineReducers } from "redux";

export default combineReducers({
  users: userReducer,
  products: productReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  productDetails: productDetailsReducer,
  address: addressReducer,
});
