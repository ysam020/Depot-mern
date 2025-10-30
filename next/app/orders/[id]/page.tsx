import { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import "../styles/orderDetails.css";
import {
  fetchOrderById,
  cancelOrder,
  clearCurrentOrder,
} from "../redux/features/orders/orders";
import getStatusColor from "../utils/getStatusColor";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get order state from Redux
  const {
    loading,
    currentOrder: order,
    error,
  } = useSelector((state) => state.orders);

  useEffect(() => {
    document.title = `Order #${id} - Depot`;
    // Fetch order details when component mounts
    dispatch(fetchOrderById(id));

    // Clear current order when component unmounts
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (confirmCancel) {
      try {
        await dispatch(cancelOrder(id)).unwrap();
        alert("Order cancelled successfully");
        // Refresh order details
        dispatch(fetchOrderById(id));
      } catch (error) {
        alert(error || "Failed to cancel order");
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle Firestore timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("en-IN", {
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

  const canCancelOrder = (status) => {
    const cancellableStatuses = ["pending", "confirmed"];
    return cancellableStatuses.includes(status?.toLowerCase());
  };

  const canTrackOrder = (status) => {
    const trackableStatuses = ["confirmed", "processing", "shipped"];
    return trackableStatuses.includes(status?.toLowerCase());
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

  if (error || !order) {
    return (
      <Container className="order-details-page">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error || "Order not found"}</p>
          <button onClick={() => navigate("/orders")} className="back-btn">
            Back to Orders
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="order-details-page">
      {/* Order Header */}
      <div className="order-details-header">
        <h2>Order Details</h2>
      </div>

      {/* Order Summary */}
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
                <span className="summary-label">Status</span>
                <span
                  className="summary-value"
                  style={{
                    color: getStatusColor(order.status),
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div className="summary-item">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value amount">₹{order.total}</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Order Items */}
      <Card className="items-card">
        <Card.Body>
          <h5 className="card-title">Order Items</h5>
          <div className="order-items-list">
            {order.order_items &&
              order.order_items.map((item, index) => (
                <div key={index} className="order-item-detail">
                  <div className="item-image-container">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="item-image"
                    />
                  </div>
                  <div className="item-details">
                    <h6 className="item-title">{item.title}</h6>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                    <p className="item-quantity">Price: ₹{item.price}</p>
                  </div>
                  <div className="item-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">₹{order.total}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <Row className="total-row">
              <Col xs={8} className="text-end">
                <strong>Total:</strong>
              </Col>
              <Col xs={4} className="text-end">
                <strong>₹{order.total}</strong>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Shipping Address */}
      {(order.shippingAddress || order.shipping_address) && (
        <Card className="address-card">
          <Card.Body>
            <h5 className="card-title">Shipping Address</h5>
            {formatAddress(order.shippingAddress || order.shipping_address)}
          </Card.Body>
        </Card>
      )}

      {/* Order Actions */}
      <div className="order-action-buttons">
        {canTrackOrder(order.status) && (
          <button
            className="track-order-btn"
            onClick={() => navigate(`/track-order/${order.id}`)}
          >
            <LocalShippingIcon /> Track Order
          </button>
        )}
        {canCancelOrder(order.status) && (
          <button className="cancel-order-btn" onClick={handleCancelOrder}>
            <CancelIcon /> Cancel Order
          </button>
        )}
        <button
          className="contact-support-btn"
          onClick={() => navigate("/contact")}
        >
          Contact Support
        </button>
      </div>
    </Container>
  );
}

export default OrderDetails;
