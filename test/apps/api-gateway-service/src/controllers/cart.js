import BaseController from "./base.js";
import { grpcClientManager } from "@depot/grpc-utils";
import { CartServiceClient } from "@depot/proto-defs/cart";

class CartController extends BaseController {
  constructor() {
    const cartClient = grpcClientManager.getClient(
      "CART_SERVICE",
      CartServiceClient
    );
    super(cartClient);
  }

  addToCart = async (req, res) => {
    const { id, quantity = 1 } = req.body;

    // Manual validation for specific error message
    if (!id) {
      return this.sendValidationError(res, {
        id: "Product ID is required",
      });
    }

    await this.executeGrpcCall(
      req,
      res,
      "addToCart",
      { id, quantity },
      {
        transformer: (response) => ({ cart: response.cart }),
        successMessage: "Product added to cart",
        errorMessage: "Failed to add product to cart",
        statusCode: 201,
        includeMetadata: true, // Requires authentication
      }
    );
  };

  updateCart = async (req, res) => {
    const id = this.extractId(req);
    const { quantity } = req.body;

    if (!quantity) {
      return this.sendValidationError(res, {
        quantity: "Quantity is required",
      });
    }

    await this.executeGrpcCall(
      req,
      res,
      "updateCart",
      { id, quantity },
      {
        transformer: (response) => ({ carts: response.carts }),
        successMessage: "Cart updated successfully",
        errorMessage: "Failed to update cart",
        includeMetadata: true,
      }
    );
  };

  deleteFromCart = async (req, res) => {
    const id = this.extractId(req);

    await this.executeGrpcCall(
      req,
      res,
      "deleteCart",
      { id },
      {
        transformer: (response) => ({ cart: response.cart }),
        successMessage: "Product removed from cart",
        errorMessage: "Failed to remove product from cart",
        includeMetadata: true,
      }
    );
  };

  getCart = async (req, res) => {
    await this.executeGrpcCall(
      req,
      res,
      "getCart",
      {},
      {
        transformer: (response) => ({ carts: response.carts || [] }),
        successMessage: "Cart fetched successfully",
        errorMessage: "Failed to fetch cart",
        includeMetadata: true,
      }
    );
  };
}

export default new CartController();
