import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EmptyCart from "../components/EmptyCart";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Tooltip } from "@material-ui/core";
import CircularProgress from "@mui/material/CircularProgress";
import { getCartData } from "../utils/getCartData";
import { Link } from "react-router-dom";
import QuickViewModal from "../components/productComponents/QuickViewModal";
import { ProductContext } from "../contexts/Context";
import useWishlistData from "../customHooks/useWishlistData";
import useQuickViewModal from "../customHooks/quickViewModal";

const useStyles = makeStyles((theme) =>
  createStyles({
    deleteIcon: {
      color: "#F15C6D !important",
    },
  })
);

function Wishlist(props) {
  // MUI Styles
  const classes = useStyles();

  const { email, loading } = useWishlistData();
  const { wishlistData, setCartData, cartData, addToCart } =
    useContext(ProductContext);
  const [selectedProduct, setSelectedProduct] = useState();
  const { openModal, handleOpenModal, handleCloseModal } = useQuickViewModal();

  useEffect(() => {
    document.title = "Wishlist - Depot";
    // eslint-disable-next-line
  }, []);

  return (
    <Container className="cart">
      {loading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : wishlistData.length === 0 && !loading ? (
        <EmptyCart />
      ) : (
        <Row>
          <Col xs={12} lg={12}>
            <Row className="cart-list">
              <Col xs={5}>
                <h5>items</h5>
              </Col>
              <Col xs={2}>
                <h5>price</h5>
              </Col>
              <Col xs={3}></Col>
              <Col xs={2}></Col>
            </Row>
            {wishlistData.map((product, id) => {
              return (
                <Row key={id} className="cart-list">
                  <Col xs={2}>
                    <img src={product.image} alt="product-img" />
                  </Col>
                  <Col xs={3}>
                    <p>{product.title}</p>
                  </Col>
                  <Col xs={2}>
                    <p>{`$ ${product.price}`}</p>
                  </Col>
                  <Col>
                    <button
                      onClick={() => {
                        handleOpenModal();
                        setSelectedProduct(product);
                      }}
                      className="wishlist-btn"
                    >
                      Quick View
                    </button>
                  </Col>
                  <Col>
                    {cartData.find((item) => item.id === product.id) ? (
                      <Link to="/cart" className="go-to-cart">
                        Go to Cart
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(product, email).then(() =>
                            getCartData(setCartData, email)
                          );
                        }}
                        className="add-to-cart"
                      >
                        Add to Cart
                      </button>
                    )}
                  </Col>
                  <Col xs={1}>
                    <Tooltip title="Remove from wishlist">
                      <IconButton
                        onClick={() =>
                          props.removeFromWishlist(email, product.id)
                        }
                        className={classes.deleteIcon}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Col>
                </Row>
              );
            })}
          </Col>
        </Row>
      )}
      {selectedProduct && (
        <QuickViewModal
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          selectedProduct={selectedProduct}
        />
      )}
    </Container>
  );
}

export default Wishlist;
