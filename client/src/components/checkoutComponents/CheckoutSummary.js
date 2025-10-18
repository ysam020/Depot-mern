import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import useSelectors from "../../customHooks/useSelectors";

function CheckoutSummary() {
  const { cartData } = useSelectors();
  const total_price = cartData.cart.reduce((accumeletor, item) => {
    return accumeletor + item.price * item.quantity; // get total cost of products in cart
  }, 0);

  return (
    <Container className="order-details">
      <Row className="order-details-row">
        <Col sm={8}>
          <h6>Product</h6>
        </Col>
        <Col>
          <h6>Subtotal</h6>
        </Col>
      </Row>
      {cartData.cart.map((product, id) => {
        return (
          <Row key={id} className="order-details-row">
            <Col sm={8}>
              <p>{product.title}</p>
            </Col>
            <Col>{`$ ${product.price}`}</Col>
          </Row>
        );
      })}
      <Row className="order-details-row">
        <Col sm={8}>
          <p>Total</p>
        </Col>
        <Col>
          <p>{`$ ${total_price.toFixed(2)}`}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default CheckoutSummary;
