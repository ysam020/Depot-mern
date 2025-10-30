class MessageMapper {
  static mapCartItem(cartItem, MessageType) {
    return MessageType.fromPartial({
      id: cartItem.product.id,
      title: cartItem.product.title,
      price: Math.floor(cartItem.product.price),
      image: cartItem.product.image,
      quantity: cartItem.quantity,
    });
  }

  static mapCartItems(cartItems, MessageType) {
    return cartItems.map((item) => this.mapCartItem(item, MessageType));
  }

  static mapWishlistItem(wishlistItem, MessageType) {
    return MessageType.fromPartial({
      id: wishlistItem.product.id,
      title: wishlistItem.product.title,
      price: Math.floor(wishlistItem.product.price),
      image: wishlistItem.product.image,
      quantity: 1,
    });
  }

  static mapWishlistItems(wishlistItems, MessageType) {
    return wishlistItems.map((item) => this.mapWishlistItem(item, MessageType));
  }

  static mapOrderItem(orderItem) {
    return {
      id: orderItem.id,
      order_id: orderItem.order_id,
      product_id: orderItem.product_id,
      quantity: orderItem.quantity,
      price: orderItem.price,
      title: orderItem.product?.title || "",
      image: orderItem.product?.image || "",
    };
  }

  static mapOrder(order) {
    const dateObj =
      order.created_at instanceof Date
        ? order.created_at
        : new Date(order.created_at || Date.now());

    return {
      id: order.id,
      user_id: order.user_id,
      total: order.total,
      status: order.status,
      created_at: dateObj,
      order_items:
        order.order_items?.map((item) => this.mapOrderItem(item)) || [],
      payment_id: order.payment_id || 0,
      shipping_address: order.shipping_address || "",
    };
  }

  static mapOrders(orders) {
    return orders.map((order) => this.mapOrder(order));
  }

  static mapPayment(payment, orderId = null) {
    return {
      id: payment.id?.toString() || "0",
      order_id: orderId || payment.order_id || 0,
      razorpay_order_id: payment.razorpay_order_id || "",
      razorpay_payment_id: payment.razorpay_payment_id || "",
      razorpay_signature: payment.razorpay_signature || "",
      amount: payment.amount || 0,
      currency: payment.currency || "INR",
      status: payment.status || "pending",
      user_id: payment.user_id || 0,
      payment_method: payment.payment_method || "unknown",
      created_at: payment.created_at || new Date(),
    };
  }

  static mapProduct(product) {
    return {
      id: product.id,
      title: product.title,
      description: product.description || "",
      price: Math.floor(product.price),
      image: product.image || "",
      category: product.category || "",
      qty: product.qty || 0,
      created_at: product.created_at || new Date(),
    };
  }

  static mapProducts(products) {
    return products.map((product) => this.mapProduct(product));
  }

  static formatDate(date) {
    if (date instanceof Date) return date;
    return new Date(date || Date.now());
  }

  static formatPrice(price) {
    return Math.floor(price || 0);
  }

  static sanitizeString(value, defaultValue = "") {
    return value?.toString().trim() || defaultValue;
  }

  static sanitizeInt(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  static sanitizeFloat(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  static parseJSON(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      return defaultValue;
    }
  }

  static stringifyJSON(obj, defaultValue = "") {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      return defaultValue;
    }
  }
}

export { MessageMapper };
