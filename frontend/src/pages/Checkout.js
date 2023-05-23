import React, { useEffect, useState } from "react";
import BillingForm from "../forms/BillingForm";
import "../styles/checkout.css";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { cardNumberField } from "../utils/CardNumberField";
import Radio from "@mui/material/Radio";
import CheckoutCard from "../components/checkoutComponents/CheckoutCard";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import CheckoutSummary from "../components/checkoutComponents/CheckoutSummary";
import useSelectors from "../customHooks/useSelectors";
import { deleteAddress, fetchAddress } from "../redux/features/address/address";
import { useDispatch } from "react-redux";

function Checkout() {
  const navigate = useNavigate();
  const [personalDetails, setPersonalDetails] = useState();
  const [billingFormSubmitted, setBillingFormSubmitted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { cartData, email, savedAddress } = useSelectors();
  const [useSavedAddress, setUseSavedAddress] = useState(
    savedAddress.address.length > 0 ? true : false
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAddress(email));
    // eslint-disable-next-line
  }, [email]);

  useEffect(() => {
    if (savedAddress.address.length === 0) {
      setUseSavedAddress(false);
    }
  }, [savedAddress.address]);

  useEffect(() => {
    if (!cartData.loading && cartData.cart.length === 0) {
      navigate("/"); // if cart is empty, navigate to homepage
    }
    // eslint-disable-next-line
  }, [cartData.loading]);

  useEffect(() => {
    cardNumberField();
    document.title = "Checkout - Depot";
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
            {savedAddress.loading ? (
              <div className="loading">
                <CircularProgress />
              </div>
            ) : (
              <div>
                {/* If not using a saved address and a saved address is available, ask user to use one */}
                {savedAddress.address.length > 0 && (
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

                {/* If using a saved address and a saved address is available, show the saved addresses */}
                {useSavedAddress && savedAddress.address.length > 0 && (
                  <Row className="saved-address">
                    {savedAddress.address.map((address, id) => {
                      return (
                        <Col lg={6} key={id} className="saved-address-col">
                          <div className="address">
                            <Radio
                              style={{ alignItems: "flex-start" }}
                              disableRipple
                              checked={
                                JSON.stringify(selectedAddress) ===
                                JSON.stringify(address)
                              }
                              onChange={() => {
                                handleAddressChange(address);
                                setBillingFormSubmitted(true);
                              }}
                              name="address"
                            />
                            <div style={{ flex: 1 }}>
                              <p>
                                {address.name}
                                <br />
                                {address.addressLine1}
                                <br />
                                {address.addressLine2}
                                <br />
                                {address.town}
                                <br />
                                {address.zip}
                                <br />
                                {address.state}
                              </p>
                            </div>
                            <Tooltip title="Delete Address">
                              <IconButton
                                onClick={() =>
                                  dispatch(
                                    deleteAddress({ email, address })
                                  ).then(() => dispatch(fetchAddress(email)))
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

                {/* If not using a saved address, show the form */}
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

      <CheckoutSummary />
    </div>
  );
}

export default Checkout;
