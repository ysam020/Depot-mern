import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Modal, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import "../styles/orderDetails.css";
import apiClient from "../config/axiosConfig";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    document.title = `Order #${id} - Depot`;
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiClient.get(`/orders/${id}`);

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

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const response = await apiClient.patch(`/orders/${id}/cancel`);

      if (response.data.success) {
        setOrder(response.data.data);
        setShowCancelModal(false);
        // Show success notification (you can add a toast notification here)
        alert("Order cancelled successfully");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
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

  const canCancelOrder = (status) => {
    const cancellableStatuses = ["pending", "confirmed"];
    return cancellableStatuses.includes(status?.toLowerCase());
  };

  if (loading) {
    return (
      <Container className="order-details-page">
        <div className="loading-container">
          <CircularProgress style={{ color: "#000" }} />
          <p>Loading order details...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="order-details-page">
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
                <span className="summary-label">Status</span>
                <span
                  className="summary-value status-badge"
                  style={{
                    backgroundColor: getStatusColor(order.status),
                    color: "white",
                    padding: "5px 15px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                  }}
                >
                  {getStatusIcon(order.status)} {order.status?.toUpperCase()}
                </span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* Left Column - Order Items */}
        <Col md={8}>
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

          {/* Action Buttons */}
          <div className="order-action-buttons">
            {(order.status === "shipped" ||
              order.status === "processing" ||
              order.status === "confirmed") && (
              <button
                onClick={() => navigate(`/track-order/${order.id}`)}
                className="track-order-btn"
              >
                <LocalShippingIcon /> Track Order
              </button>
            )}

            {canCancelOrder(order.status) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="cancel-order-btn"
              >
                <CancelIcon /> Cancel Order
              </button>
            )}
          </div>
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
                  <span className="info-value transaction-id">
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

      {/* Cancel Order Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this order?</p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Order #{order.id} - Total: ₹{order.total}
          </p>
          <p
            style={{ fontSize: "0.9rem", color: "#dc3545", marginTop: "15px" }}
          >
            This action cannot be undone. Your refund will be processed within
            5-7 business days.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelling}
            style={{
              backgroundColor: "#f8f9fa",
              color: "#333",
              border: "1px solid #dee2e6",
            }}
          >
            Keep Order
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelOrder}
            disabled={cancelling}
            style={{
              backgroundColor: "#dc3545",
              border: "none",
            }}
          >
            {cancelling ? (
              <>
                <CircularProgress
                  size={20}
                  style={{ color: "white", marginRight: "10px" }}
                />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel Order"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderDetails;
