import axios from "axios";

export async function updateCart(email, productId, qty, cartData, setCartData) {
  try {
    const response = await axios.put(
      `http://localhost:9002/${email}/cart/${productId}`,
      {
        qty,
      }
    );
    if (response.status === 200) {
      // Update the cart data in the state
      const updatedCartData = cartData.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            qty,
          };
        }
        return item;
      });
      setCartData(updatedCartData);
    }
  } catch (error) {
    console.error(error);
  }
}
