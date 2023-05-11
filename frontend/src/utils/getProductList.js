// import axios from "axios";

// export async function getProductList(setData, setLoading, filterCategory) {
//   setLoading(true);
//   await axios("http://localhost:9002/products")
//     .then((response) => {
//       if (filterCategory === "") {
//         setData(response.data);
//       } else {
//         const products = response.data;
//         setData(
//           products.filter(
//             (product) =>
//               product.category.toLowerCase().trim() ===
//                 filterCategory.toLowerCase() ||
//               product.color.toLowerCase() === filterCategory.toLowerCase() ||
//               product.material.toLowerCase() === filterCategory.toLowerCase()
//           )
//         );
//       }
//     })
//     .catch((error) => console.error(error))
//     .finally(() => setLoading(false));
// }
