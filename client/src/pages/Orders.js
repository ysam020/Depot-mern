import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import "../styles/orders.css";
import apiClient from "../config/axiosConfig";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "My Orders - Depot";
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get("/orders");

      console.log("Orders response:", response.data);

      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.error || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle protobuf timestamp format
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Handle regular date string
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (addressString) => {
    if (!addressString) return "N/A";

    try {
      const address = JSON.parse(addressString);
      return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
    } catch {
      return addressString;
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

  // Check if order can be tracked
  const canTrackOrder = (status) => {
    const trackableStatuses = ["confirmed", "processing", "shipped"];
    return trackableStatuses.includes(status?.toLowerCase());
  };

  if (loading) {
    return (
      <Container className="orders-page">
        <div className="loading-container">
          <CircularProgress />
          <p>Loading your orders...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="orders-page">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Retry
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="orders-page">
      <div className="orders-header">
        <h2>My Orders</h2>
        <p className="orders-count">
          {orders.length === 0
            ? "No orders yet"
            : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>Looks like you haven't placed any orders yet.</p>
          <button onClick={() => navigate("/")} className="shop-now-btn">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Card key={order.id} className="order-card">
              <Card.Body>
                <Row className="order-header-row">
                  <Col xs={12} md={3}>
                    <div className="order-info-item">
                      <span className="info-label">Order ID</span>
                      <span className="info-value">#{order.id}</span>
                    </div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div className="order-info-item">
                      <span className="info-label">Date</span>
                      <span className="info-value">
                        {formatDate(order.createdAt || order.created_at)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div className="order-info-item">
                      <span className="info-label">Total</span>
                      <span className="info-value total-amount">
                        ₹{order.total}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div className="order-info-item">
                      <span className="info-label">Status</span>
                      <span
                        className="info-value order-status"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        {getStatusIcon(order.status)}{" "}
                        {order.status?.toUpperCase()}
                      </span>
                    </div>
                  </Col>
                </Row>

                <div className="order-divider"></div>

                <div className="order-items">
                  <h6 className="order-items-title">Items Ordered:</h6>
                  {(order.orderItems || order.order_items || []).map(
                    (item, index) => (
                      <Row key={index} className="order-item">
                        <Col xs={3} md={2}>
                          <img
                            src={item.image}
                            alt={item.title}
                            className="order-item-image"
                          />
                        </Col>
                        <Col xs={6} md={7}>
                          <div className="order-item-details">
                            <h6 className="order-item-title">{item.title}</h6>
                            <p className="order-item-quantity">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </Col>
                        <Col xs={3} md={3} className="text-end">
                          <div className="order-item-price">
                            <span className="price-label">Price:</span>
                            <span className="price-value">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    )
                  )}
                </div>

                {(order.shippingAddress || order.shipping_address) && (
                  <>
                    <div className="order-divider"></div>
                    <div className="shipping-address">
                      <h6 className="shipping-title">Shipping Address:</h6>
                      <p className="shipping-text">
                        {formatAddress(
                          order.shippingAddress || order.shipping_address
                        )}
                      </p>
                    </div>
                  </>
                )}

                <div className="order-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View Details
                  </button>
                  {canTrackOrder(order.status) && (
                    <button
                      className="track-order-btn"
                      onClick={() => navigate(`/track-order/${order.id}`)}
                    >
                      Track Order
                    </button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export default Orders;
