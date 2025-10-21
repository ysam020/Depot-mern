import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../styles/trackOrder.css";
import apiClient from "../config/axiosConfig";

function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Track Order #${id} - Depot`;
    fetchOrderAndTracking();
  }, [id]);

  const fetchOrderAndTracking = async () => {
    try {
      const orderResponse = await apiClient.get(`/orders/${id}`);

      if (orderResponse.data.success) {
        setOrder(orderResponse.data.data);
        setTracking(generateMockTracking(orderResponse.data.data));
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(
        err.response?.data?.error || "Failed to fetch tracking information"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateMockTracking = (orderData) => {
    const baseDate = new Date(
      orderData.createdAt?.seconds
        ? orderData.createdAt.seconds * 1000
        : orderData.created_at
    );

    const mockEvents = [];
    const status = orderData.status?.toLowerCase();

    mockEvents.push({
      status: "Order Placed",
      location: "Mumbai, Maharashtra",
      date: baseDate,
      description: "Your order has been placed successfully",
      icon: "✓",
      completed: true,
    });

    if (["confirmed", "processing", "shipped", "delivered"].includes(status)) {
      const confirmedDate = new Date(baseDate);
      confirmedDate.setHours(confirmedDate.getHours() + 1);
      mockEvents.push({
        status: "Order Confirmed",
        location: "Warehouse, Mumbai",
        date: confirmedDate,
        description: "Your order has been confirmed and is being prepared",
        icon: "✓",
        completed: true,
      });
    }

    if (["processing", "shipped", "delivered"].includes(status)) {
      const processingDate = new Date(baseDate);
      processingDate.setHours(processingDate.getHours() + 4);
      mockEvents.push({
        status: "Processing",
        location: "Warehouse, Mumbai",
        date: processingDate,
        description: "Your order is being packed",
        icon: "📦",
        completed: true,
      });
    }

    if (["shipped", "delivered"].includes(status)) {
      const shippedDate = new Date(baseDate);
      shippedDate.setDate(shippedDate.getDate() + 1);
      mockEvents.push({
        status: "Shipped",
        location: "Mumbai Sorting Facility",
        date: shippedDate,
        description: "Your order has been shipped via Delhivery",
        icon: "🚚",
        completed: true,
      });

      const transitDate = new Date(shippedDate);
      transitDate.setDate(transitDate.getDate() + 1);
      mockEvents.push({
        status: "In Transit",
        location: "Pune, Maharashtra",
        date: transitDate,
        description: "Your package is on the way",
        icon: "🚚",
        completed: status === "delivered",
      });
    }

    if (status === "delivered" || status === "shipped") {
      const outForDeliveryDate = new Date(baseDate);
      outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 3);
      mockEvents.push({
        status: "Out for Delivery",
        location: "Local Delivery Hub",
        date: outForDeliveryDate,
        description: "Your package is out for delivery",
        icon: "🚚",
        completed: status === "delivered",
      });
    }

    if (status === "delivered") {
      const deliveredDate = new Date(baseDate);
      deliveredDate.setDate(deliveredDate.getDate() + 3);
      deliveredDate.setHours(deliveredDate.getHours() + 4);
      mockEvents.push({
        status: "Delivered",
        location: "Delivered to Customer",
        date: deliveredDate,
        description: "Your package has been delivered successfully",
        icon: "✓",
        completed: true,
      });
    }

    const expectedDate = new Date(baseDate);
    expectedDate.setDate(expectedDate.getDate() + 5);

    return {
      waybill: `TRACK${id}${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`,
      courier: "Delhivery",
      currentStatus: status.charAt(0).toUpperCase() + status.slice(1),
      expectedDelivery: expectedDate,
      events: mockEvents,
    };
  };

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

  if (error || !order) {
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
        <button
          onClick={() => navigate(`/orders/${id}`)}
          className="back-button"
        >
          <ArrowBackIcon /> Back to Order Details
        </button>
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
                    <span className="info-label">Tracking ID</span>
                    <span className="info-value tracking-id">
                      {tracking?.waybill || "N/A"}
                    </span>
                  </div>
                </Col>
                <Col md={4} xs={12}>
                  <div className="tracking-info-item">
                    <span className="info-label">Courier Partner</span>
                    <span className="info-value">{tracking?.courier}</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="current-status-card">
            <Card.Body>
              <div className="status-header">
                <LocalShippingIcon className="status-icon" />
                <div className="status-text">
                  <h5>{tracking?.currentStatus}</h5>
                  <p>
                    Expected delivery: {formatDate(tracking?.expectedDelivery)}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="timeline-card">
            <Card.Body>
              <h5 className="timeline-title">Shipment Timeline</h5>
              <div className="tracking-timeline">
                {tracking?.events.map((event, index) => (
                  <div
                    key={index}
                    className={`timeline-event ${
                      event.completed ? "completed" : "pending"
                    }`}
                  >
                    <div className="event-marker">
                      <div className="marker-icon">
                        {event.completed ? (
                          <CheckCircleIcon />
                        ) : (
                          <div className="pending-dot"></div>
                        )}
                      </div>
                      {index < tracking.events.length - 1 && (
                        <div className="marker-line"></div>
                      )}
                    </div>
                    <div className="event-content">
                      <div className="event-header">
                        <h6 className="event-status">
                          {event.icon} {event.status}
                        </h6>
                        <span className="event-date">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <p className="event-location">
                        <LocationOnIcon fontSize="small" /> {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="order-summary-sidebar">
            <Card.Body>
              <h5 className="card-title">Order Summary</h5>
              <div className="summary-items">
                {(order.orderItems || order.order_items || []).map(
                  (item, index) => (
                    <div key={index} className="summary-item">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="summary-item-image"
                      />
                      <div className="summary-item-info">
                        <p className="item-name">{item.title}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="summary-total">
                <span>Total Amount</span>
                <span className="total-amount">₹{order.total}</span>
              </div>
            </Card.Body>
          </Card>

          <Card className="delivery-address-card">
            <Card.Body>
              <h5 className="card-title">Delivery Address</h5>
              {(() => {
                try {
                  const address = JSON.parse(
                    order.shippingAddress || order.shipping_address
                  );
                  return (
                    <div className="address-content">
                      <p className="address-name">
                        <strong>
                          {address.first_name} {address.last_name}
                        </strong>
                      </p>
                      <p>{address.address}</p>
                      <p>
                        {address.city}, {address.state}
                      </p>
                      <p>PIN: {address.pincode}</p>
                      <p>Phone: {address.phone}</p>
                    </div>
                  );
                } catch {
                  return (
                    <p>{order.shippingAddress || order.shipping_address}</p>
                  );
                }
              })()}
            </Card.Body>
          </Card>

          <Card className="help-card">
            <Card.Body>
              <h5 className="card-title">Need Help?</h5>
              <p className="help-text">
                If you have any questions about your shipment, feel free to
                contact us.
              </p>
              <button className="contact-btn">Contact Support</button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TrackOrder;
