import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <Container className="footer">
      <Row>
        <svg
          className="footer-divider"
          _ngcontent-okh-c39=""
          aria-hidden="true"
          width="100%"
          height="8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            _ngcontent-okh-c39=""
            id="a"
            width="91"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <g _ngcontent-okh-c39="" clipPath="url(#clip0_2426_11367)">
              <path
                _ngcontent-okh-c39=""
                d="M114 4c-5.067 4.667-10.133 4.667-15.2 0S88.667-.667 83.6 4 73.467 8.667 68.4 4 58.267-.667 53.2 4 43.067 8.667 38 4 27.867-.667 22.8 4 12.667 8.667 7.6 4-2.533-.667-7.6 4s-10.133 4.667-15.2 0S-32.933-.667-38 4s-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0"
                stroke="#E1E3E1"
                strokeLinecap="square"
              ></path>
            </g>
          </pattern>
          <rect
            _ngcontent-okh-c39=""
            width="100%"
            height="100%"
            fill="url(#a)"
          ></rect>
        </svg>
      </Row>

      <Row>
        <Col lg={3} md={6}>
          <h5>Customer Service</h5>
          <a href="/#" rel="noreferred noopener">
            Help & Contact us
          </a>
          <a href="/#" rel="noreferred noopener">
            Returns & Refunds
          </a>
          <a href="/#" rel="noreferred noopener">
            Online Stores
          </a>
          <a href="/#" rel="noreferred noopener">
            Terms & Conditions
          </a>
        </Col>
        <Col lg={3} md={6}>
          <h5>Company</h5>
          <a href="/#" rel="noreferred noopener">
            What We Do
          </a>
          <a href="/#" rel="noreferred noopener">
            Available Services
          </a>
          <a href="/#" rel="noreferred noopener">
            Latest Posts
          </a>
          <a href="/#" rel="noreferred noopener">
            FAQs
          </a>
        </Col>
        <Col lg={3} md={6}>
          <h5>Social Media</h5>
          <a href="/#" rel="noreferred noopener">
            Twitter
          </a>
          <a href="/#" rel="noreferred noopener">
            Instagram
          </a>
          <a href="/#" rel="noreferred noopener">
            Tumblr
          </a>
          <a href="/#" rel="noreferred noopener">
            Pinterest
          </a>
        </Col>
        <Col lg={3} md={6}>
          <h5>PROFILE</h5>
          <a href="/#" rel="noreferred noopener">
            My Account
          </a>
          <a href="/#" rel="noreferred noopener">
            Checkout
          </a>
          <a href="/#" rel="noreferred noopener">
            Order Tracking
          </a>
          <a href="/#" rel="noreferred noopener">
            Help & Support
          </a>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
