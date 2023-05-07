import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import axios from "axios";
import { ProductContext } from "./contexts/Context";
import useCartData from "./customHooks/useCartData";
import useWishlistData from "./customHooks/useWishlistData";

function App() {
  const { cartData, setCartData, cartQty, setCartQty } = useCartData();
  const { wishlistData, setWishlistData, wishlistQty, setWishlistQty } =
    useWishlistData();

  async function addToCart(product, email) {
    setCartQty((prevState) => prevState + 1);

    const { id, price, title, image } = product;
    const qty = 1;
    try {
      const response = await axios.post(`http://localhost:9002/${email}/cart`, {
        email,
        id,
        price,
        title,
        image,
        qty,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function addToWishlist(product, email) {
    setWishlistQty((prevState) => prevState + 1);

    const { id, price, title, image, rating, shortDescription } = product;
    try {
      const response = await axios.post(
        `http://localhost:9002/${email}/wishlist`,
        {
          email,
          id,
          price,
          title,
          image,
          rating,
          shortDescription,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function removeFromCart(email, id) {
    setCartQty((prevState) => prevState - 1);

    try {
      const response = await axios.delete(
        `http://localhost:9002/${email}/cart/${id}`
      );
      if (response.status === 200) {
        const updatedCartData = cartData.filter((item) => item.id !== id);
        setCartData(updatedCartData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function removeFromWishlist(email, id) {
    setWishlistQty((prevState) => prevState - 1);

    try {
      const response = await axios.delete(
        `http://localhost:9002/${email}/wishlist/${id}`
      );
      if (response.status === 200) {
        const updatedWishlistData = wishlistData.filter(
          (item) => item.id !== id
        );
        setWishlistData(updatedWishlistData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ProductContext.Provider
      value={{
        cartData: cartData,
        wishlistData: wishlistData,
        setCartData: setCartData,
        setWishlistData: setWishlistData,
        addToCart: addToCart,
        addToWishlist: addToWishlist,
      }}
    >
      <div className="App">
        <NavBar cartQty={cartQty} wishlistQty={wishlistQty} />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route
              exact
              path="/cart"
              element={<Cart removeFromCart={removeFromCart} />}
            />
            <Route
              exact
              path="/wishlist"
              element={<Wishlist removeFromWishlist={removeFromWishlist} />}
            />
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
    </ProductContext.Provider>
  );
}

export default App;
