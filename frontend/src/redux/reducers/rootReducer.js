import userReducer from "./userReducer";
import productReducer from "./productReducer";
import { combineReducers } from "redux";

export default combineReducers({
  users: userReducer,
  products: productReducer,
});
