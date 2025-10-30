import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../config/axiosConfig";

const initialState = {
  loading: false,
  orders: [],
  currentOrder: null,
  trackingInfo: null,
  error: "",
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/orders");
      if (res.data.success) {
        return res.data.data.orders;
      }
      return [];
    } catch (error) {
      console.error("Fetch orders error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data.success) {
        return res.data.data.order;
      }
      throw new Error("Order not found");
    } catch (error) {
      console.error("Fetch order by ID error:", error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch order details"
      );
    }
  }
);

export const trackOrder = createAsyncThunk(
  "orders/trackOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data.success) {
        const order = res.data.data.order;

        const trackingInfo = generateTrackingInfo(order);
        return { order, trackingInfo };
      }
      throw new Error("Order not found");
    } catch (error) {
      console.error("Track order error:", error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch tracking information"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        return { orderId, message: res.data.message };
      }
      throw new Error("Failed to cancel order");
    } catch (error) {
      console.error("Cancel order error:", error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to cancel order"
      );
    }
  }
);

const generateTrackingInfo = (order) => {
  const baseDate = new Date(
    order.createdAt?.seconds
      ? order.createdAt.seconds * 1000
      : order.createdAt || order.created_at
  );

  const status = order.status?.toLowerCase() || "pending";
  const mockEvents = [];

  mockEvents.push({
    status: "Order Placed",
    description: "Your order has been placed successfully",
    date: baseDate,
    completed: true,
  });

  if (["confirmed", "processing", "shipped", "delivered"].includes(status)) {
    const confirmedDate = new Date(baseDate);
    confirmedDate.setHours(confirmedDate.getHours() + 2);
    mockEvents.push({
      status: "Order Confirmed",
      description: "Your order has been confirmed and is being prepared",
      date: confirmedDate,
      completed: true,
    });
  }

  if (["processing", "shipped", "delivered"].includes(status)) {
    const processingDate = new Date(baseDate);
    processingDate.setDate(processingDate.getDate() + 1);
    mockEvents.push({
      status: "Processing",
      description: "Your order is being processed at our warehouse",
      date: processingDate,
      completed: true,
    });
  }

  if (["shipped", "delivered"].includes(status)) {
    const shippedDate = new Date(baseDate);
    shippedDate.setDate(shippedDate.getDate() + 2);
    mockEvents.push({
      status: "Shipped",
      description: "Your order has been shipped and is on the way",
      date: shippedDate,
      completed: true,
    });
  }

  if (status === "delivered") {
    const outForDeliveryDate = new Date(baseDate);
    outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 4);
    mockEvents.push({
      status: "Out for Delivery",
      description: "Your order is out for delivery",
      date: outForDeliveryDate,
      completed: true,
    });
  }

  if (status === "delivered") {
    const deliveredDate = new Date(baseDate);
    deliveredDate.setDate(deliveredDate.getDate() + 5);
    mockEvents.push({
      status: "Delivered",
      description: "Your order has been delivered successfully",
      date: deliveredDate,
      completed: true,
    });
  } else {
    const expectedDate = new Date(baseDate);
    expectedDate.setDate(expectedDate.getDate() + 5);
    mockEvents.push({
      status: "Expected Delivery",
      description: "Your order is expected to be delivered by this date",
      date: expectedDate,
      completed: false,
    });
  }

  return {
    currentStatus: order.status,
    estimatedDelivery: mockEvents[mockEvents.length - 1].date,
    events: mockEvents,
  };
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = "";
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
      state.error = "";
    },
    clearOrdersError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = "";
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.orders = [];
        state.error = action.payload;
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = "";
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.currentOrder = null;
        state.error = action.payload;
      })

      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.trackingInfo = action.payload.trackingInfo;
        state.error = "";
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.trackingInfo = null;
        state.error = action.payload;
      })

      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;

        const orderIndex = state.orders.findIndex(
          (order) => order.id === action.payload.orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = "cancelled";
        }

        if (state.currentOrder?.id === action.payload.orderId) {
          state.currentOrder.status = "cancelled";
        }
        state.error = "";
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearTrackingInfo, clearOrdersError } =
  ordersSlice.actions;

export default ordersSlice.reducer;
