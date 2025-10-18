import { useState } from "react";

function usePagination(data) {
  const [pageNumber, setPageNumber] = useState(0);
  const productsPerPage = 8;
  const pageCount = Math.ceil(data.length / productsPerPage);
  const pagesVisited = pageNumber * productsPerPage;
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return { productsPerPage, pageCount, pagesVisited, changePage };
}

export default usePagination;
