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

  const { user, productDetails, cartData } = useSelectors();

  const product = productDetails.product;

  useEffect(() => {
    dispatch(fetchProductDetails(productId));

    // Fetch cart if user is logged in
    if (user && user.accessToken) {
      dispatch(fetchCartData());
    }
    // eslint-disable-next-line
  }, [productId]);

  useEffect(() => {
    if (product && product.title) {
      document.title = `${product.title} - Depot`;
    }
  }, [product]);

  // Check if product is in cart - with safety checks
  const isInCart =
    product && Array.isArray(cartData.cart)
      ? cartData.cart.some((item) => item.id === product.id)
      : false;

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
              minHeight: "400px",
            }}
          >
            <CircularProgress />
          </div>
        ) : !product ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <h3>Product not found</h3>
            <Link to="/">Return to Home</Link>
          </div>
        ) : (
          <Row>
            <Col xs={12} lg={6} className="product-details-left-col">
              <img
                src={product.image}
                alt={product.title || "Product"}
                width="100%"
              />
            </Col>
            <Col xs={12} lg={6} className="product-details-right-col">
              <h2>{product.title}</h2>
              <h5>{`$ ${(product.price || 0).toFixed(2)}`}</h5>

              <p className="product-short-description">
                {product.description ||
                  product.shortDescription ||
                  "No description available"}
              </p>

              {product.category && (
                <p className="product-info">
                  <span className="product-info-heading">CATEGORY:&nbsp;</span>
                  {product.category.toUpperCase()}
                </p>
              )}

              {product.color && (
                <p className="product-info">
                  <span className="product-info-heading">COLOR:&nbsp;</span>
                  {product.color}
                </p>
              )}

              {product.material && (
                <p className="product-info">
                  <span className="product-info-heading">MATERIAL:&nbsp;</span>
                  {product.material}
                </p>
              )}

              {product.dimensions && (
                <p className="product-info">
                  <span className="product-info-heading">
                    DIMENSIONS:&nbsp;
                  </span>
                  {product.dimensions}
                </p>
              )}

              {product.weight && (
                <p className="product-info">
                  <span className="product-info-heading">WEIGHT:&nbsp;</span>
                  {product.weight}
                </p>
              )}

              {product.sku && (
                <p className="product-info">
                  <span className="product-info-heading">SKU:&nbsp;</span>
                  {product.sku}
                </p>
              )}

              <br />

              {!user || !user.accessToken ? (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  Please log in to add items to cart
                </p>
              ) : isInCart ? (
                <Link to="/cart" className="go-to-cart">
                  Go to Cart
                </Link>
              ) : (
                <button
                  onClick={() => {
                    dispatch(addProductToCart({ product }));
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

      {product && <ProductAdditionalInfo data={product} />}
    </>
  );
}

export default ProductDetails;
