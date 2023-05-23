import React, { useEffect } from "react";
import "../styles/product-details.css";
import { Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import ProductAdditionalInfo from "../components/productComponents/ProductAdditionalInfo";
import useSelectors from "../customHooks/useSelectors";
import { useDispatch } from "react-redux";
import { fetchProductDetails } from "../redux/features/productDetails/productDetails";
import { addProductToCart, fetchCartData } from "../redux/features/cart/cart";

function ProductDetails() {
  const params = useParams();
  const productId = params.productId;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    // eslint-disable-next-line
  }, []);

  const { email, productDetails, cartData } = useSelectors();
  const product = productDetails.product;

  useEffect(() => {
    if (productDetails.product) {
      document.title = `${productDetails.product.title} - Depot`;
    }
  }, [productDetails.product]);

  return (
    <>
      <Container className="product-details-page">
        {productDetails.loading ? (
          <div
            className="loading"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <Row>
            <Col xs={12} lg={6} className="product-details-left-col">
              <img src={productDetails.product?.image} alt="" width="100%" />
            </Col>
            <Col xs={12} lg={6} className="product-details-right-col">
              <h2>{productDetails.product?.title}</h2>
              <h5>{`$ ${productDetails.product.price?.toFixed(2)}`}</h5>

              <p className="product-short-description">
                {productDetails.product?.description}
              </p>

              <p className="product-info">
                <span className="product-info-heading">CATEGORY:&nbsp;</span>
                {productDetails.product.category?.toUpperCase()}
              </p>

              <br />

              {cartData.cart.find(
                (product) => product.id === productDetails.product.id
              ) ? (
                <Link to="/cart" className="go-to-cart">
                  Go to Cart
                </Link>
              ) : (
                <button
                  onClick={() => {
                    dispatch(addProductToCart({ product, email }));
                  }}
                  className="add-to-cart"
                >
                  Add to Cart
                </button>
              )}
            </Col>
          </Row>
        )}
      </Container>

      <ProductAdditionalInfo data={productDetails.product} />
    </>
  );
}

export default ProductDetails;
