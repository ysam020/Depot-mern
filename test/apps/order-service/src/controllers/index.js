import grpc from "@grpc/grpc-js";
import prisma from "@depot/prisma";
import { BaseServiceController } from "@depot/grpc-utils";
import { createOrderHandler } from "../handlers/createOrder.handler.js";
import { getOrderHandler } from "../handlers/getOrder.handler.js";
import { listOrdersByUserHandler } from "../handlers/listOrdersByUser.handler.js";
import { updateOrderStatusHandler } from "../handlers/updateOrderStatus.handler.js";

class OrderController extends BaseServiceController {
  constructor() {
    super(prisma.orders, process.env.JWT_SECRET);
    this.orderItemsModel = prisma.order_items;
    this.productsModel = prisma.products;
    this.paymentsModel = prisma.payments;
    this.grpc = grpc;
    this.VALID_ORDER_STATUSES = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
  }

  async findOrderWithItems(orderId, userId) {
    return await this.findOne(
      { id: orderId, user_id: userId },
      {
        include: {
          order_items: {
            include: {
              product: {
                select: {
                  title: true,
                  image: true,
                },
              },
            },
          },
        },
      }
    );
  }

  async findUserOrders(userId) {
    return await this.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            product: {
              select: {
                title: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async updateOrderStatus(orderId, status) {
    return await this.update(
      { id: orderId },
      { status },
      {
        include: {
          order_items: {
            include: {
              product: {
                select: {
                  title: true,
                  image: true,
                },
              },
            },
          },
        },
      }
    );
  }

  isValidStatus(status) {
    return this.VALID_ORDER_STATUSES.includes(status);
  }

  async createOrderWithItems(userId, items, total, paymentId, shippingAddress) {
    try {
      const order = await this.transaction(async (tx) => {
        const newOrder = await tx.orders.create({
          data: {
            user_id: userId,
            total,
            status: "confirmed",
            shipping_address: shippingAddress,
          },
        });

        const orderItems = await Promise.all(
          items.map(async (item) => {
            const product = await tx.products.findUnique({
              where: { id: item.product_id },
            });

            if (!product) {
              throw new Error(`Product ${item.product_id} not found`);
            }

            if (product.qty < item.quantity) {
              throw new Error(
                `Insufficient stock for ${product.title}. Available: ${product.qty}, Requested: ${item.quantity}`
              );
            }

            const orderItem = await tx.order_items.create({
              data: {
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
              },
              include: {
                product: {
                  select: {
                    title: true,
                    image: true,
                  },
                },
              },
            });

            await tx.products.update({
              where: { id: item.product_id },
              data: { qty: product.qty - item.quantity },
            });

            return orderItem;
          })
        );

        if (paymentId) {
          await tx.payments.update({
            where: { id: paymentId },
            data: { order_id: newOrder.id },
          });
        }

        const completeOrder = {
          ...newOrder,
          order_items: orderItems,
          created_at:
            newOrder.created_at instanceof Date
              ? newOrder.created_at
              : new Date(newOrder.created_at || Date.now()),
        };

        return completeOrder;
      });

      return order;
    } catch (err) {
      this.logError("Failed to create order with items", err);
      return null;
    }
  }

  async validateProductAvailability(productId, quantity) {
    const product = await this.productsModel.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (product.qty < quantity) {
      throw new Error(
        `Insufficient stock for ${product.title}. Available: ${product.qty}, Requested: ${quantity}`
      );
    }

    return product;
  }

  async reduceProductQuantity(productId, quantity) {
    const product = await this.productsModel.findUnique({
      where: { id: productId },
    });

    return await this.productsModel.update({
      where: { id: productId },
      data: { qty: product.qty - quantity },
    });
  }

  async createOrder(call, callback) {
    await createOrderHandler(this, call, callback);
  }

  async getOrder(call, callback) {
    await getOrderHandler(this, call, callback);
  }

  async listOrdersByUser(call, callback) {
    await listOrdersByUserHandler(this, call, callback);
  }

  async updateOrderStatus(call, callback) {
    await updateOrderStatusHandler(this, call, callback);
  }
}

export default OrderController;
