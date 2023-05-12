import React, { useEffect, useState } from "react";
import BillingForm from "../forms/BillingForm";
import "../styles/checkout.css";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { cardNumberField } from "../utils/CardNumberField";
import { getSavedAddress } from "../utils/getSavedAddress";
import Radio from "@mui/material/Radio";
import CheckoutCard from "../components/checkoutComponents/CheckoutCard";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { deleteAddress } from "../utils/deleteAddress";
import CheckoutSummary from "../components/checkoutComponents/CheckoutSummary";
import useCartData from "../customHooks/useCartData";
import useSavedAddressHook from "../customHooks/useSavedAddress";

function Checkout() {
  const navigate = useNavigate();
  const [personalDetails, setPersonalDetails] = useState();
  const [billingFormSubmitted, setBillingFormSubmitted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const { cartData, email, loading } = useCartData();
  const { savedAddress, setSavedAddress, useSavedAddress, setUseSavedAddress } =
    useSavedAddressHook();

  useEffect(() => {
    if (!loading) {
      if (cartData.length === 0) {
        navigate("/");
      }
    }
    document.title = "Checkout - Depot";
    // eslint-disable-next-line
  }, [loading]);

  useEffect(() => {
    cardNumberField();
  }, []);

  const handleAddressChange = (item) => {
    setUseSavedAddress(true);
    setSelectedAddress(item);
  };

  return (
    <div className="checkout-page">
      <Container className="checkout-form">
        <Row>
          <Col xs={12} md={6}>
            {loading ? (
              <div className="loading">
                <CircularProgress />
              </div>
            ) : (
              <div>
                {!useSavedAddress && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <Radio
                      style={{ alignItems: "flex-start" }}
                      disableRipple
                      name="address"
                      checked={useSavedAddress}
                      onChange={() => {
                        setUseSavedAddress(!useSavedAddress);
                      }}
                    />
                    <p>Use a saved address</p>
                  </div>
                )}

                {useSavedAddress && (
                  <Row className="saved-address">
                    {savedAddress.map((item, id) => {
                      return (
                        <Col lg={6} key={id} className="saved-address-col">
                          <div className="address">
                            <Radio
                              style={{ alignItems: "flex-start" }}
                              disableRipple
                              checked={
                                JSON.stringify(selectedAddress) ===
                                JSON.stringify(item)
                              }
                              onChange={() => {
                                handleAddressChange(item);
                                setBillingFormSubmitted(true);
                              }}
                              name="address"
                            />
                            <div style={{ flex: 1 }}>
                              <p>
                                {item.name}
                                <br />
                                {item.addressLine1}
                                <br />
                                {item.addressLine2}
                                <br />
                                {item.town}
                                <br />
                                {item.zip}
                                <br />
                                {item.state}
                              </p>
                            </div>
                            <Tooltip title="Delete Address">
                              <IconButton
                                onClick={() =>
                                  deleteAddress(email, item).then(() =>
                                    getSavedAddress(setSavedAddress, email)
                                  )
                                }
                                disableRipple
                                sx={{ alignItems: "flex-start" }}
                              >
                                <DeleteIcon
                                  sx={{
                                    color: "#F15C6D",
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </Col>
                      );
                    })}
                    {useSavedAddress && (
                      <div style={{ display: "flex" }}>
                        <Radio
                          style={{ alignItems: "flex-start" }}
                          disableRipple
                          name="address"
                          checked={!useSavedAddress}
                          onChange={() => {
                            setUseSavedAddress(!useSavedAddress);
                            setSelectedAddress(null);
                            setBillingFormSubmitted(false);
                          }}
                        />
                        <p style={{ marginTop: "10px" }}>Use a new address</p>
                      </div>
                    )}
                  </Row>
                )}
                {!useSavedAddress && (
                  <BillingForm
                    setBillingFormSubmitted={setBillingFormSubmitted}
                    setPersonalDetails={setPersonalDetails}
                  />
                )}
              </div>
            )}
          </Col>
          <Col>
            <div
              className={`${
                billingFormSubmitted
                  ? "checkout-cardDetails"
                  : "checkout-cardDetails disabled"
              } `}
            >
              <CheckoutCard
                useSavedAddress={useSavedAddress}
                selectedAddress={selectedAddress}
                personalDetails={personalDetails}
              />
            </div>
          </Col>
        </Row>
      </Container>

      <CheckoutSummary cartData={cartData} />
    </div>
  );
}

export default Checkout;
