import { useState, useEffect } from "react";
import { getWishlistData } from "../utils/getWishlistData";
import { useSelector } from "react-redux";

function useWishlistData() {
  const [wishlistData, setWishlistData] = useState([]);
  const [wishlistQty, setWishlistQty] = useState(wishlistData.length);
  const email = useSelector((state) => state.users.email);

  useEffect(() => {
    getWishlistData(setWishlistData, email);
    // eslint-disable-next-line
  }, [email]);

  useEffect(() => {
    setWishlistQty(wishlistData.length);
  }, [wishlistData]);

  return { wishlistData, setWishlistData, wishlistQty, setWishlistQty, email };
}

export default useWishlistData;
