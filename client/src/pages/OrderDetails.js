import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import "../styles/orderDetails.css";
import apiClient from "../config/axiosConfig";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Order #${id} - Depot`;
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiClient.get(`/orders/${id}`);

      console.log("Order details response:", response.data);

      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      if (err.response?.status === 403) {
        setError("You don't have permission to view this order");
      } else if (err.response?.status === 404) {
        setError("Order not found");
      } else {
        setError(err.response?.data?.error || "Failed to fetch order details");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (addressString) => {
    if (!addressString) return null;

    try {
      const address = JSON.parse(addressString);
      return (
        <div className="address-details">
          <p className="address-name">
            <strong>
              {address.first_name} {address.last_name}
            </strong>
          </p>
          <p className="address-line">{address.address}</p>
          <p className="address-line">
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="address-phone">Phone: {address.phone}</p>
        </div>
      );
    } catch {
      return <p className="address-line">{addressString}</p>;
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#ffc107",
      confirmed: "#28a745",
      processing: "#17a2b8",
      shipped: "#007bff",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };
    return statusColors[status?.toLowerCase()] || "#6c757d";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: "⏳",
      confirmed: "✅",
      processing: "📦",
      shipped: "🚚",
      delivered: "✓",
      cancelled: "❌",
    };
    return statusIcons[status?.toLowerCase()] || "•";
  };

  const getOrderProgress = (status) => {
    const progressMap = {
      pending: 20,
      confirmed: 40,
      processing: 60,
      shipped: 80,
      delivered: 100,
      cancelled: 0,
    };
    return progressMap[status?.toLowerCase()] || 0;
  };

  if (loading) {
    return (
      <Container className="order-details-page">
        <div className="loading-container">
          <CircularProgress />
          <p>Loading order details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="order-details-page">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/orders")} className="back-btn">
            Back to Orders
          </button>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="order-details-page">
        <div className="error-container">
          <h3>Order Not Found</h3>
          <button onClick={() => navigate("/orders")} className="back-btn">
            Back to Orders
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="order-details-page">
      {/* Header */}
      <div className="order-details-header">
        <button onClick={() => navigate("/orders")} className="back-button">
          <ArrowBackIcon /> Back to Orders
        </button>
        <h2>Order Details</h2>
      </div>

      {/* Order Summary Card */}
      <Card className="order-summary-card">
        <Card.Body>
          <Row>
            <Col md={3} xs={6}>
              <div className="summary-item">
                <span className="summary-label">Order ID</span>
                <span className="summary-value">#{order.id}</span>
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div className="summary-item">
                <span className="summary-label">Order Date</span>
                <span className="summary-value">
                  {formatDate(order.createdAt || order.created_at)}
                </span>
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div className="summary-item">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value amount">₹{order.total}</span>
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div className="summary-item">
                <span className="summary-label">Payment</span>
                <span className="summary-value payment-status">✓ Paid</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* Left Column - Order Status & Items */}
        <Col md={8}>
          {/* Order Status Timeline */}
          <Card className="status-card">
            <Card.Body>
              <h5 className="card-title">Order Status</h5>

              <div className="status-badge-container">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(order.status),
                  }}
                >
                  {getStatusIcon(order.status)} {order.status?.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="order-progress">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${getOrderProgress(order.status)}%`,
                      backgroundColor: getStatusColor(order.status),
                    }}
                  ></div>
                </div>
              </div>

              {/* Status Steps */}
              <div className="status-timeline">
                <div
                  className={`timeline-step ${
                    order.status === "confirmed" ||
                    order.status === "processing" ||
                    order.status === "shipped" ||
                    order.status === "delivered"
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="step-icon">✓</div>
                  <div className="step-label">Confirmed</div>
                </div>
                <div
                  className={`timeline-step ${
                    order.status === "processing" ||
                    order.status === "shipped" ||
                    order.status === "delivered"
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="step-icon">📦</div>
                  <div className="step-label">Processing</div>
                </div>
                <div
                  className={`timeline-step ${
                    order.status === "shipped" || order.status === "delivered"
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="step-icon">🚚</div>
                  <div className="step-label">Shipped</div>
                </div>
                <div
                  className={`timeline-step ${
                    order.status === "delivered" ? "active" : ""
                  }`}
                >
                  <div className="step-icon">✓</div>
                  <div className="step-label">Delivered</div>
                </div>
              </div>

              {/* Track Order Button */}
              {(order.status === "shipped" ||
                order.status === "processing" ||
                order.status === "confirmed") && (
                <div className="track-button-container">
                  <button
                    onClick={() => navigate(`/track-order/${order.id}`)}
                    className="track-order-button"
                  >
                    <LocalShippingIcon /> Track Your Order
                  </button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="items-card">
            <Card.Body>
              <h5 className="card-title">Order Items</h5>
              <div className="order-items-list">
                {(order.orderItems || order.order_items || []).map(
                  (item, index) => (
                    <div key={index} className="order-item-detail">
                      <div className="item-image-container">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="item-image"
                        />
                      </div>
                      <div className="item-info">
                        <h6 className="item-title">{item.title}</h6>
                        <p className="item-quantity">
                          Quantity: {item.quantity}
                        </p>
                        <p className="item-price">₹{item.price} each</p>
                      </div>
                      <div className="item-total">
                        <span className="total-label">Total</span>
                        <span className="total-value">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Order Total */}
              <div className="order-total-section">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">₹{order.total}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Shipping</span>
                  <span className="total-value free">FREE</span>
                </div>
                <div className="total-row grand-total">
                  <span className="total-label">Grand Total</span>
                  <span className="total-value">₹{order.total}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Shipping & Payment Info */}
        <Col md={4}>
          {/* Shipping Address */}
          <Card className="info-card">
            <Card.Body>
              <h5 className="card-title">Shipping Address</h5>
              {formatAddress(order.shippingAddress || order.shipping_address)}
            </Card.Body>
          </Card>

          {/* Payment Information */}
          <Card className="info-card">
            <Card.Body>
              <h5 className="card-title">Payment Information</h5>
              <div className="payment-info">
                <div className="info-row">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">Razorpay</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Payment Status</span>
                  <span className="info-value paid">Paid</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Transaction ID</span>
                  <span className="info-value">
                    {order.paymentId || order.payment_id || "N/A"}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Need Help */}
          <Card className="info-card help-card">
            <Card.Body>
              <h5 className="card-title">Need Help?</h5>
              <p className="help-text">
                Have questions about your order? Contact our support team.
              </p>
              <button className="contact-support-btn">Contact Support</button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default OrderDetails;
