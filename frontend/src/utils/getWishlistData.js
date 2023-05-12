import axios from "axios";

export async function getWishlistData(setWishlistData, email) {
  await axios(`https://depot-d06m.onrender.com/${email}/wishlist`).then(
    (response) => setWishlistData(response.data)
  );
}
