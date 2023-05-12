import { useState, useEffect } from "react";
import axios from "axios";

function useProductDetails(productId) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProductList() {
      try {
        const response = await axios.get(
          `https://depot-d06m.onrender.com/products/${productId}`
        );
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    getProductList();
    // eslint-disable-next-line
  }, [productId]);

  return { data, setData, loading, setLoading };
}

export default useProductDetails;
