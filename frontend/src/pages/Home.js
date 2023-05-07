import React, { useState } from "react";
import "../styles/home.css";
import { Container, Row, Col } from "react-bootstrap";
import Lottie from "lottie-react";
import homeBannerLottie from "../assets/lottie-files/home-banner.json";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Pagination from "../components/productComponents/Pagination";
import ProductFilters from "../components/productComponents/ProductFilters";
import useProductsData from "../customHooks/productsData";

function Home() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const { data, setData, loading, setLoading } =
    useProductsData(filterCategory);

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
              data={data}
              setData={setData}
              setLoading={setLoading}
            />
          </Col>
          <Col xs={10}>
            {loading ? (
              <div className="loading">
                <CircularProgress />
              </div>
            ) : (
              <Pagination data={data} setOpenSnackbar={setOpenSnackbar} />
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

export default Home;
