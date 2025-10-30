import { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import "../styles/orders.css";
import { fetchOrders } from "../redux/features/orders/orders";
import getStatusColor from "../utils/getStatusColor";

function Orders() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get orders state from Redux
  const { loading, orders, error } = useSelector((state) => state.orders);

  useEffect(() => {
    document.title = "My Orders - Depot";
    // Fetch orders when component mounts
    dispatch(fetchOrders());
  }, [dispatch]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle Firestore timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAddress = (addressString) => {
    if (!addressString) return null;

    try {
      const address = JSON.parse(addressString);
      return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
    } catch {
      return addressString;
    }
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
          <button onClick={() => dispatch(fetchOrders())} className="retry-btn">
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
                        className="info-value status-badge"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </Col>
                </Row>

                <div className="order-divider"></div>

                <div className="order-items">
                  {order.order_items &&
                    order.order_items.map((item, index) => (
                      <Row key={index} className="order-item">
                        <Col xs={3} md={2}>
                          <img
                            src={item.image}
                            alt={item.title}
                            className="order-item-image"
                          />
                        </Col>
                        <Col xs={9} md={10}>
                          <Row>
                            <Col xs={12} md={8}>
                              <div className="item-info">
                                <h6 className="order-item-title">
                                  {item.title}
                                </h6>
                                <p className="order-item-details">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </Col>
                            <Col xs={12} md={4} className="text-md-end">
                              <div className="item-price">
                                <span className="price-label">Price:</span>
                                <span className="price-value">
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    ))}
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
