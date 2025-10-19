import { useSelector } from "react-redux";

function useSelectors() {
  // Safely get user data with fallback to empty object
  const user = useSelector((state) => state.users.user) || {};
  const { name = null, email = null } = user;

  const cartData = useSelector((state) => state.cart);
  const wishlistData = useSelector((state) => state.wishlist);
  const productsData = useSelector((state) => state.products);
  const productDetails = useSelector((state) => state.productDetails);
  const savedAddress = useSelector((state) => state.address);

  return {
    name,
    email,
    user,
    cartData,
    wishlistData,
    productsData,
    productDetails,
    savedAddress,
  };
}

export default useSelectors;
