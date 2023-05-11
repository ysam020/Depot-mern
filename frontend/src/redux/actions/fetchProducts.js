import axios from "axios";

export const fetchProductsRequest = () => {
  return { type: "FETCH_PRODUCTS_REQUEST" };
};

export const fetchProductsSuccess = (data) => {
  return { type: "FETCH_PRODUCTS_SUCCESS", payload: data };
};

export const fetchProductsError = (error) => {
  return { type: "FETCH_PRODUCTS_ERROR", payload: error };
};

export const fetchProducts = (filterCategory, sortCategory) => {
  return (dispatch) => {
    dispatch(fetchProductsRequest());
    axios
      .get("http://localhost:9002/products")
      .then((res) => {
        let data = res.data;

        // Filter
        if (filterCategory !== "") {
          data = data.filter(
            (product) =>
              product.category.toLowerCase().trim() ===
                filterCategory.toLowerCase() ||
              product.color.toLowerCase() === filterCategory.toLowerCase() ||
              product.material.toLowerCase() === filterCategory.toLowerCase()
          );
        }

        // Sort
        if (sortCategory === "Sort by Price: Low to high") {
          data = data.sort((a, b) => a.price - b.price);
        } else if (sortCategory === "Sort by Price: High to low") {
          data = data.sort((a, b) => b.price - a.price);
        } else if (sortCategory === "Sort by Rating") {
          data = data.sort((a, b) => b.rating.rate - a.rating.rate);
        }

        dispatch(fetchProductsSuccess(data));
      })
      .catch((err) => {
        dispatch(fetchProductsError(err.message));
      });
  };
};
