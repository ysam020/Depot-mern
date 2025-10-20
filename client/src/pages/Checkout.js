import { useEffect, useState } from "react";
import BillingForm from "../forms/BillingForm";
import "../styles/checkout.css";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import CheckoutSummary from "../components/checkoutComponents/CheckoutSummary";
import useSelectors from "../customHooks/useSelectors";
import axios from "axios";

function Checkout() {
  const navigate = useNavigate();
  const [personalDetails, setPersonalDetails] = useState();
  const [billingFormSubmitted, setBillingFormSubmitted] = useState(false);
  const { cartData, email, savedAddress } = useSelectors();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!cartData.loading && cartData.cart.length === 0) {
      navigate("/");
    }
    // eslint-disable-next-line
  }, [cartData.loading]);

  useEffect(() => {
    document.title = "Checkout - Depot";

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Calculate total amount
  const calculateTotal = () => {
    return cartData.cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Handle Razorpay payment
  const handlePayment = async () => {
    if (cartData.cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user"))?.accessToken;

      if (!token) {
        alert("Please login to continue");
        setIsProcessing(false);
        return;
      }

      const totalAmount = calculateTotal();

      // Prepare shipping address
      const shippingAddress = {
        first_name: personalDetails?.firstName || "",
        last_name: personalDetails?.lastName || "",
        address: personalDetails?.address || "",
        city: personalDetails?.city || "",
        state: personalDetails?.state || "",
        pincode: personalDetails?.pincode || "",
        phone: personalDetails?.phone || "",
      };

      console.log("Creating Razorpay order...");

      // Create order on backend
      const { data } = await axios.post(
        "http://localhost:9000/api/v1/payment/create-order",
        {
          amount: totalAmount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Order created response:", data);

      // Handle both response formats
      const orderData = data.data || data;

      // Handle both camelCase and snake_case
      const razorpayOrderId =
        orderData.razorpayOrderId || orderData.razorpay_order_id;
      const keyId = orderData.keyId || orderData.key_id;

      if (!razorpayOrderId) {
        console.error("No razorpay order ID in response:", data);
        throw new Error("Invalid order response from server");
      }

      console.log("Opening Razorpay with:", {
        order_id: razorpayOrderId,
        amount: orderData.amount,
        key: keyId,
      });

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      // Razorpay options
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Depot Store",
        description: "Payment for your order",
        order_id: razorpayOrderId,
        handler: async function (response) {
          console.log("Payment successful:", response);

          // Verify payment on backend and create order
          try {
            const verifyResponse = await axios.post(
              "http://localhost:9000/api/v1/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalAmount,
                cart_items: cartData.cart.map((item) => ({
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  image: item.image,
                  quantity: item.quantity,
                })),
                shipping_address: shippingAddress,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Verification response:", verifyResponse.data);

            if (verifyResponse.data.success) {
              const orderId =
                verifyResponse.data.data?.payment?.order_id ||
                verifyResponse.data.data?.order?.id;

              alert(
                `Payment successful! ${
                  orderId ? `Order #${orderId}` : "Your order"
                } has been placed.`
              );
              navigate("/");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          email: email || "",
          contact: shippingAddress.phone || "",
        },
        notes: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment cancelled by user");
            setIsProcessing(false);
            alert("Payment cancelled");
          },
        },
      };

      console.log("Initializing Razorpay...");
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      console.log("Razorpay modal opened");
    } catch (error) {
      console.error("Payment error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      alert(
        `Failed to initiate payment: ${error.message}. Check console for details.`
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <Container className="checkout-form">
        <Row>
          <Col xs={12} md={6}>
            <h4>BILLING DETAILS</h4>
            <BillingForm
              setPersonalDetails={setPersonalDetails}
              setBillingFormSubmitted={setBillingFormSubmitted}
            />
          </Col>

          <Col xs={12} md={6}>
            <div className="order-details">
              <h6>Order Summary</h6>
              <CheckoutSummary />

              <button
                onClick={handlePayment}
                disabled={isProcessing || cartData.loading}
                className="submit-card-details"
                style={{
                  marginTop: "30px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  opacity: isProcessing ? 0.6 : 1,
                }}
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Checkout;
