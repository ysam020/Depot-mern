import { useSelector } from "react-redux";

function useSelectors() {
  const { name, email } = useSelector((state) => state.users.user);
  const cartData = useSelector((state) => state.cart);
  const wishlistData = useSelector((state) => state.wishlist);
  const productsData = useSelector((state) => state.products);
  const productDetails = useSelector((state) => state.productDetails);
  const savedAddress = useSelector((state) => state.address);

  return {
    name,
    email,
    cartData,
    wishlistData,
    productsData,
    productDetails,
    savedAddress,
  };
}

export default useSelectors;
