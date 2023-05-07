import { useEffect, useState } from "react";
import { getCartData } from "../utils/getCartData";
import { useSelector } from "react-redux";

function useCartData() {
  const [cartData, setCartData] = useState([]);
  const [cartQty, setCartQty] = useState(cartData.length);
  const [loading, setLoading] = useState(true);
  const email = useSelector((state) => state.userReducer.email);

  useEffect(() => {
    getCartData(setCartData, email).then(() => setLoading(false));
  }, [email]);

  useEffect(() => {
    setCartQty(cartData.length);
  }, [cartData]);

  return {
    cartData,
    setCartData,
    cartQty,
    setCartQty,
    loading,
    setLoading,
    email,
  };
}

export default useCartData;
