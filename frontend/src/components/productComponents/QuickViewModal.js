import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCartData } from "../../utils/getCartData";
import Rating from "@mui/material/Rating";
import { ProductContext } from "../../contexts/Context";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
};

export default function QuickViewModal(props) {
  const email = useSelector((state) => state.userReducer.email);

  const context = useContext(ProductContext);

  return (
    <div>
      <Modal
        open={props.openModal}
        onClose={props.handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Container fluid>
            <Row>
              <Col xl={6} style={{ padding: 0 }}>
                <img
                  src={props.selectedProduct.image}
                  alt="product-img"
                  width="100%"
                />
              </Col>
              <Col
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "0 20px",
                }}
              >
                <h3>{props.selectedProduct.title}</h3>
                <p>{`$ ${props.selectedProduct.price}`}</p>
                <Rating
                  name="read-only"
                  value={props.selectedProduct.rating.rate}
                  readOnly
                  className="product-rating"
                />
                <p style={{ marginTop: "20px" }}>
                  {props.selectedProduct.shortDescription}
                </p>

                {context.cartData.find(
                  (item) => item.id === props.selectedProduct.id
                ) ? (
                  <Link to="/cart" className="go-to-cart">
                    Go to Cart
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      context
                        .addToCart(props.selectedProduct, email)
                        .then(() => getCartData(context.setCartData, email));
                    }}
                    className="add-to-cart"
                  >
                    Add to Cart
                  </button>
                )}
              </Col>
            </Row>
          </Container>
        </Box>
      </Modal>
    </div>
  );
}
