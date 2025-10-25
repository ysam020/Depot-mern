import { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../styles/trackOrder.css";
import {
  trackOrder,
  clearTrackingInfo,
  clearCurrentOrder,
} from "../redux/features/orders/orders";
import getStatusColor from "../utils/getStatusColor";

function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get order and tracking state from Redux
  const {
    loading,
    currentOrder: order,
    trackingInfo: tracking,
    error,
  } = useSelector((state) => state.orders);

  useEffect(() => {
    document.title = `Track Order #${id} - Depot`;
    // Fetch tracking information when component mounts
    dispatch(trackOrder(id));

    // Clear tracking info when component unmounts
    return () => {
      dispatch(clearTrackingInfo());
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container className="track-order-page">
        <div className="loading-container">
          <CircularProgress />
          <p>Loading tracking information...</p>
        </div>
      </Container>
    );
  }

  if (error || !order || !tracking) {
    return (
      <Container className="track-order-page">
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
    <Container className="track-order-page">
      <div className="track-header">
        <h2>Track Your Order</h2>
      </div>

      <Row>
        <Col md={8}>
          <Card className="tracking-summary-card">
            <Card.Body>
              <Row>
                <Col md={4} xs={6}>
                  <div className="tracking-info-item">
                    <span className="info-label">Order ID</span>
                    <span className="info-value">#{order.id}</span>
                  </div>
                </Col>
                <Col md={4} xs={6}>
                  <div className="tracking-info-item">
                    <span className="info-label">Current Status</span>
                    <span
                      className="summary-value"
                      style={{
                        color: getStatusColor(order.status),
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {tracking.currentStatus.toUpperCase()}
                    </span>
                  </div>
                </Col>
                <Col md={4} xs={12}>
                  <div className="tracking-info-item">
                    <span className="info-label">Expected Delivery</span>
                    <span className="info-value">
                      {formatDate(tracking.estimatedDelivery)}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Timeline */}
          <Card className="tracking-timeline-card">
            <Card.Body>
              <h5 className="timeline-title">Order Timeline</h5>
              <div className="tracking-timeline">
                {tracking.events.map((event, index) => (
                  <div
                    key={index}
                    className={`timeline-item ${
                      event.completed ? "completed" : "pending"
                    }`}
                  >
                    <div className="timeline-marker">
                      {event.completed ? (
                        <CheckCircleIcon className="completed-icon" />
                      ) : (
                        <div className="pending-dot"></div>
                      )}
                    </div>
                    <div className="timeline-content">
                      <h6 className="timeline-status">{event.status}</h6>
                      <p className="timeline-description">
                        {event.description}
                      </p>
                      <p className="timeline-date">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Order Summary */}
          <Card className="order-summary-sidebar">
            <Card.Body>
              <h5 className="sidebar-title">Order Summary</h5>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-label">Items:</span>
                  <span className="summary-value">
                    {order.items?.length || 0}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Total:</span>
                  <span className="summary-value">₹{order.total}</span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="items-preview">
                <h6 className="preview-title">Items in this order:</h6>
                {order.items &&
                  order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="preview-item">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="preview-image"
                      />
                      <div className="preview-info">
                        <p className="preview-item-title">{item.title}</p>
                        <p className="preview-item-qty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                {order.items && order.items.length > 3 && (
                  <p className="more-items">
                    +{order.items.length - 3} more item(s)
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Shipping Address */}
          {(order.shippingAddress || order.shipping_address) && (
            <Card className="shipping-address-card">
              <Card.Body>
                <h5 className="sidebar-title">
                  <LocationOnIcon className="location-icon" /> Shipping Address
                </h5>
                <div className="address-content">
                  {(() => {
                    try {
                      const address = JSON.parse(
                        order.shippingAddress || order.shipping_address
                      );
                      return (
                        <>
                          <p className="address-name">
                            {address.first_name} {address.last_name}
                          </p>
                          <p className="address-line">{address.address}</p>
                          <p className="address-line">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="address-phone">{address.phone}</p>
                        </>
                      );
                    } catch {
                      return (
                        <p className="address-line">
                          {order.shippingAddress || order.shipping_address}
                        </p>
                      );
                    }
                  })()}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Help Section */}
          <Card className="help-card">
            <Card.Body>
              <h5 className="sidebar-title">Need Help?</h5>
              <p className="help-text">
                If you have any questions about your order, please contact our
                support team.
              </p>
              <button
                className="contact-btn"
                onClick={() => navigate("/contact")}
              >
                Contact Support
              </button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TrackOrder;
