import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function CheckoutSummary(props) {
  const total_price = props.cartData.reduce((accumeletor, item) => {
    return accumeletor + item.price * item.qty;
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
      {props.cartData.map((product, id) => {
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
