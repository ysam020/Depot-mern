import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EmptyCart from "../components/EmptyCart";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import useSelectors from "../customHooks/useSelectors";
import {
  fetchCartData,
  removeProductFromCart,
  updateCart,
} from "../redux/features/cart/cart";
import { useDispatch } from "react-redux";

function Cart() {
  const { cartData, email } = useSelectors();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCartData(email));
    document.title = "Cart - Depot";
    // eslint-disable-next-line
  }, [email]);

  console.log(cartData.cart);

  const total_price = cartData.cart.reduce((accumeletor, item) => {
    return accumeletor + item.price * item.qty; // get total cost of products in cart
  }, 0);

  return (
    <Container className="cart">
      {cartData.cart.length === 0 && cartData.loading ? ( // if loading and cart is empty
        <div className="loading">
          <CircularProgress />
        </div>
      ) : cartData.cart.length === 0 && !cartData.loading ? ( // if not loading and cart is not empty
        <EmptyCart />
      ) : cartData.cart.length !== 0 && !cartData.loading ? ( // if not loading and cart is not empty
        <Row>
          <Col xs={12} lg={7}>
            <Row className="cart-list">
              <Col xs={5}>
                <h5>items</h5>
              </Col>
              <Col xs={2}>
                <h5>price</h5>
              </Col>
              <Col xs={3}>
                <h5>Quantity</h5>
              </Col>
              <Col xs={2}></Col>
            </Row>
            {cartData.cart.map((product, id) => {
              return (
                <Row key={id} className="cart-list">
                  <Col xs={1}>
                    <img src={product.image} alt="product-img" />
                  </Col>
                  <Col xs={4}>
                    <p>{product.title}</p>
                  </Col>
                  <Col xs={2}>
                    <p>{`$ ${product.price}`}</p>
                  </Col>
                  <Col xs={3}>
                    <select
                      name=""
                      id=""
                      value={product.qty}
                      onChange={(e) => {
                        dispatch(
                          updateCart({
                            email,
                            product,
                            qty: parseInt(e.target.value),
                          })
                        );
                      }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </Col>
                  <Col xs={2}>
                    <Tooltip title="Remove from cart">
                      <IconButton
                        onClick={() => {
                          dispatch(
                            removeProductFromCart({ product, email })
                          ).then(() => dispatch(fetchCartData(email)));
                        }}
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
          <Col>
            <div className="cart-totals">
              <h3>Cart Totals</h3>
              <p>Total:&nbsp; {`$ ${total_price.toFixed("2")}`}</p>
              <hr />
              <Link to="/checkout">
                <div className="checkout">Proceed to Checkout</div>
              </Link>
            </div>
          </Col>
        </Row>
      ) : (
        ""
      )}
    </Container>
  );
}

export default Cart;
