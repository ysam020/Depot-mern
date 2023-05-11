// import { useEffect, useState } from "react";
// import { getProductList } from "../utils/getProductList";

// export default function useProductsData(filterCategory) {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getProductList(setData, setLoading, filterCategory);
//     document.title = "Home - Depot";
//     // eslint-disable-next-line
//   }, [filterCategory]);

//   return { data, setData, loading, setLoading };
// }
