import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import Rating from "@mui/material/Rating";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import usePagination from "../../customHooks/pagination";
import useSelectors from "../../customHooks/useSelectors";
import {
  addProductToCart,
  fetchCartData,
} from "../../redux/features/cart/cart";
import {
  addProductToWishlist,
  fetchWishlistData,
} from "../../redux/features/wishlist/wishlist";
import { useDispatch } from "react-redux";

function Pagination(props) {
  const dispatch = useDispatch();
  const { email, cartData, wishlistData, productsData } = useSelectors();
  const { productsPerPage, pageCount, pagesVisited, changePage } =
    usePagination(productsData.products);

  useEffect(() => {
    dispatch(fetchCartData(email));
    dispatch(fetchWishlistData(email));
    // eslint-disable-next-line
  }, [email]);

  function isProductWishlisted(wishlistData, productId) {
    return wishlistData.some((product) => product.id === productId);
  }

  const handleOpenSnackbar = () => {
    props.setOpenSnackbar(true);
  };

  return (
    <>
      <Row>
        {productsData.products
          ?.slice(pagesVisited, pagesVisited + productsPerPage)
          .map((product) => {
            const { id, title, price, image, rating } = product;

            return (
              <Col
                lg={3}
                md={4}
                sm={6}
                xs={12}
                key={id}
                className="product-col"
              >
                <Link to={`/product/${id}`}>
                  <div className="product-img">
                    <Tooltip title="Add to wishlist">
                      <span>
                        <IconButton
                          disabled={isProductWishlisted(
                            wishlistData.wishlist,
                            id
                          )} // disable button if product is already wishlisted
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(
                              addProductToWishlist({ product, email })
                            ).then(() => dispatch(fetchWishlistData(email)));
                          }}
                        >
                          <FavoriteIcon
                            sx={
                              isProductWishlisted(wishlistData.wishlist, id)
                                ? {
                                    color: "#F15C6D !important",
                                    width: "20px !important",
                                    height: "20px !important",
                                  }
                                : {} // if product is wishlisted, show red icon
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
                    value={rating}
                    readOnly
                    className="product-rating"
                  />
                  {/* if cart already has the product, show go to cart button, otherwise show add to cart button */}
                  {cartData.cart.find((item) => item.id === product.id) ? (
                    <Link to="/cart" className="go-to-cart">
                      Go to Cart
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(addProductToCart({ product, email })).then(
                          () => dispatch(fetchCartData(email))
                        );
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
