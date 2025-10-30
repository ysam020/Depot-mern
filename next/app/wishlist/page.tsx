import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EmptyCart from "../components/EmptyCart";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import QuickViewModal from "../components/productComponents/QuickViewModal";
import useQuickViewModal from "../customHooks/quickViewModal";
import useSelectors from "../customHooks/useSelectors";
import { useDispatch } from "react-redux";
import { fetchCartData, addProductToCart } from "../redux/features/cart/cart";
import {
  fetchWishlistData,
  removeProductFromWishlist,
} from "../redux/features/wishlist/wishlist";

function Wishlist() {
  const { email, cartData, wishlistData } = useSelectors();
  const [selectedProduct, setSelectedProduct] = useState();
  const { openModal, handleOpenModal, handleCloseModal } = useQuickViewModal();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Wishlist - Depot";
    dispatch(fetchCartData(email));
    dispatch(fetchWishlistData(email));
    // eslint-disable-next-line
  }, [email]);

  return (
    <Container className="cart">
      {wishlistData.loading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : wishlistData.wishlist.length === 0 && !wishlistData.loading ? (
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
            {wishlistData.wishlist.map((product, id) => {
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
                    {/* if product is available in cart, show go to cart button, otherwise show add to cart button */}
                    {cartData.cart.find((item) => item.id === product.id) ? (
                      <button
                        onClick={() => navigate("/cart")}
                        className="wishlist-btn"
                      >
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          dispatch(addProductToCart({ product, email })).then(
                            () => dispatch(fetchCartData(email))
                          );
                        }}
                        className="wishlist-btn"
                      >
                        Add to Cart
                      </button>
                    )}
                  </Col>
                  <Col xs={1}>
                    <Tooltip title="Remove from wishlist">
                      <IconButton
                        onClick={() =>
                          dispatch(
                            removeProductFromWishlist({ product, email })
                          ).then(() => dispatch(fetchWishlistData(email)))
                        }
                        sx={{ color: "#F15C6D" }}
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
