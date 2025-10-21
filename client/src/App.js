import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import TrackOrder from "./pages/TrackOrder";

function App() {
  return (
    <div className="App">
      <NavBar />
      <div className="content">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/cart" element={<Cart />} />
          <Route exact path="/wishlist" element={<Wishlist />} />
          <Route exact path="/orders" element={<Orders />} />
          <Route exact path="/orders/:id" element={<OrderDetails />} />
          <Route exact path="/track-order/:id" element={<TrackOrder />} />
          <Route
            exact
            path="/product/:productId"
            element={<ProductDetails />}
          />
          <Route exact path="/checkout" element={<Checkout />} />
          <Route exact path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
