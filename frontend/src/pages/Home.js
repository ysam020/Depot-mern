import React, { useEffect, useState } from "react";
import "../styles/home.css";
import { Container, Row, Col } from "react-bootstrap";
import Lottie from "lottie-react";
import homeBannerLottie from "../assets/lottie-files/home-banner.json";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Pagination from "../components/productComponents/Pagination";
import ProductFilters from "../components/productComponents/ProductFilters";
import { connect } from "react-redux";
import { fetchProducts } from "../redux/actions/fetchProducts";

function Home(props) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortCategory, setSortCategory] = useState("");

  useEffect(() => {
    props.fetchProducts(filterCategory, sortCategory);
    // eslint-disable-next-line
  }, [filterCategory, sortCategory]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="homepage">
      {/* Home Banner */}
      <Container fluid className="home-banner">
        <Container className="hero-content">
          <Row>
            <Col lg={6} className="hero-content-col-left">
              <div className="hero-content-col-left-content">
                <h3>Depot</h3>
                <p>
                  Welcome to Depot - your ultimate online shopping destination!
                  Discover the best deals and high-quality products across a
                  wide range of categories. At Depot, we're committed to
                  providing you with a seamless shopping experience, from
                  browsing to checkout and beyond.
                </p>
                <a href="/#home-shop" className="home-banner-btn">
                  Shop Now
                </a>
              </div>
            </Col>
            <Col lg={6} className="hero-content-col-right">
              <div className="home-banner-lottie">
                <Lottie loop={true} animationData={homeBannerLottie}></Lottie>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Home Shop Section */}
      <Container className="home-shop" id="home-shop">
        <Row>
          <Col xs={2}>
            <ProductFilters
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              sortCategory={sortCategory}
              setSortCategory={setSortCategory}
              data={props.products.data}
            />
          </Col>
          <Col xs={10}>
            {props.products.loading ? (
              <div className="loading">
                <CircularProgress />
              </div>
            ) : (
              <Pagination
                data={props.products.data}
                setOpenSnackbar={setOpenSnackbar}
              />
            )}
          </Col>
        </Row>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Added to cart"
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    products: state.products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchProducts: (filterCategory, sortCategory) =>
      dispatch(fetchProducts(filterCategory, sortCategory)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
