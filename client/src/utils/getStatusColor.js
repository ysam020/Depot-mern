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

export default getStatusColor;
