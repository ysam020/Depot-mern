import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "@material-ui/core";
import Rating from "@mui/material/Rating";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { getCartData } from "../../utils/getCartData";
import { getWishlistData } from "../../utils/getWishlistData";
import ReactPaginate from "react-paginate";
import { ProductContext } from "../../contexts/Context";
import usePagination from "../../customHooks/pagination";

function Pagination(props) {
  const context = useContext(ProductContext);
  const email = useSelector((state) => state.users.email);
  const { productsPerPage, pageCount, pagesVisited, changePage } =
    usePagination(props.data);

  function isProductWishlisted(wishlistData, productId) {
    return wishlistData.some((product) => product.id === productId);
  }

  const handleOpenSnackbar = () => {
    props.setOpenSnackbar(true);
  };

  return (
    <>
      <Row>
        {props.data
          ?.slice(pagesVisited, pagesVisited + productsPerPage)
          .map((products) => {
            const { id, title, price, image, rating } = products;

            return (
              <Col lg={3} sm={6} xs={12} key={id} className="product-col">
                <Link to={`/product/${id}`}>
                  <div className="product-img">
                    <Tooltip title="Add to wishlist">
                      <span>
                        <IconButton
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                          }}
                          disabled={isProductWishlisted(
                            context.wishlistData,
                            id
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            context
                              .addToWishlist(products, email)
                              .then(() =>
                                getWishlistData(context.setWishlistData, email)
                              );
                          }}
                        >
                          <FavoriteIcon
                            sx={
                              isProductWishlisted(context.wishlistData, id)
                                ? {
                                    color: "#F15C6D !important",
                                    width: "20px !important",
                                    height: "20px !important",
                                  }
                                : {}
                            }
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <img src={image} alt="product-img" width="80%" />
                  </div>
                </Link>
                <div className="product-details">
                  <Tooltip title={title}>
                    <h5>{title}</h5>
                  </Tooltip>
                  <p>{`$ ${price}`}</p>
                  <Rating
                    name="read-only"
                    value={rating.rate}
                    readOnly
                    className="product-rating"
                  />
                  {context.cartData.find(
                    (product) => product.id === products.id
                  ) ? (
                    <Link to="/cart" className="go-to-cart">
                      Go to Cart
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        context
                          .addToCart(products, email)
                          .then(() => getCartData(context.setCartData, email));
                        handleOpenSnackbar();
                      }}
                      className="add-to-cart"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </Col>
            );
          })}
      </Row>
      ;
      <ReactPaginate
        previousLabel={"Prev"}
        nextLabel={"Next"}
        pageCount={pageCount}
        onPageChange={changePage}
        containerClassName={`paginationBttns page-count-${pageCount}`}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
      />
    </>
  );
}

export default Pagination;
