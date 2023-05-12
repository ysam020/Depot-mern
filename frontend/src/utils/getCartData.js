import axios from "axios";

export async function getCartData(setCartData, email) {
  await axios(`https://depot-d06m.onrender.com/${email}/cart`).then(
    (response) => setCartData(response.data)
  );
}
