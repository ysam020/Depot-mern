export const handleProductSorting = (e, data, setData, setLoading) => {
  setLoading(true);
  if (e.target.value === "Sort by Price: Low to high") {
    setData([...data].sort((a, b) => a.price - b.price));
  } else if (e.target.value === "Sort by Price: High to low") {
    setData([...data].sort((a, b) => b.price - a.price));
  } else if (e.target.value === "Sort by Rating") {
    setData([...data].sort((a, b) => b.rating.rate - a.rating.rate));
  }
  setLoading(false);
};
