import axios from "axios";

export async function getCartData(setCartData, email) {
  await axios(`http://localhost:9002/${email}/cart`).then((response) =>
    setCartData(response.data)
  );
}
