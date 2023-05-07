import axios from "axios";

export async function getWishlistData(setWishlistData, email) {
  await axios(`http://localhost:9002/${email}/wishlist`).then((response) =>
    setWishlistData(response.data)
  );
}
