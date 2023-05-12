import React, { useContext, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EmptyCart from "../components/EmptyCart";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import useCartData from "../customHooks/useCartData";
import { ProductContext } from "../contexts/Context";
import { useSelector } from "react-redux";
import { updateCart } from "../utils/updateCart";

function Cart(props) {
  const email = useSelector((state) => state.userReducer.email);
  const { cartData, setCartData } = useContext(ProductContext);
  const { loading } = useCartData();

  useEffect(() => {
    document.title = "Cart - Depot";
  }, []);

  const total_price = cartData.reduce((accumeletor, item) => {
    return accumeletor + item.price * item.qty;
  }, 0);

  return (
    <Container className="cart">
      {loading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : cartData.length === 0 && !loading ? (
        <EmptyCart />
      ) : (
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
            {cartData.map((product, id) => {
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
                      onChange={(e) =>
                        updateCart(
                          email,
                          product.id,
                          e.target.value,
                          cartData,
                          setCartData
                        )
                      }
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
                        onClick={() => props.removeFromCart(email, product.id)}
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
      )}
    </Container>
  );
}

export default Cart;
