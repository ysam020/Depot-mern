import React, { useEffect, useContext } from "react";
import "../styles/product-details.css";
import { Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { getCartData } from "../utils/getCartData";
import { ProductContext } from "../contexts/Context";
import ProductAdditionalInfo from "../components/productComponents/ProductAdditionalInfo";
import useProductDetails from "../customHooks/productDetails";

function ProductDetails() {
  const params = useParams();
  const productId = params.productId;
  const { data, loading } = useProductDetails(productId);

  const email = useSelector((state) => state.users.email);

  const context = useContext(ProductContext);

  useEffect(() => {
    if (data) {
      document.title = `${data.title} - Depot`;
    }
  }, [data]);

  return (
    <>
      <Container className="product-details-page">
        {loading ? (
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
              <img src={data?.image} alt="" width="100%" />
            </Col>
            <Col xs={12} lg={6} className="product-details-right-col">
              <h2>{data?.title}</h2>
              <h5>{`$ ${data?.price.toFixed(2)}`}</h5>

              <p className="product-short-description">{data?.description}</p>

              <p className="product-info">
                <span className="product-info-heading">CATEGORY:&nbsp;</span>
                {data?.category.toUpperCase()}
              </p>

              <br />

              {context.cartData.find((product) => product.id === data.id) ? (
                <Link to="/cart" className="go-to-cart">
                  Go to Cart
                </Link>
              ) : (
                <button
                  onClick={() => {
                    context
                      .addToCart(data, email)
                      .then(() => getCartData(context.setCartData, email));
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

      <ProductAdditionalInfo data={data} />
    </>
  );
}

export default ProductDetails;
