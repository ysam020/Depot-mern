import BaseController from "./base.js";
import { grpcClientManager } from "@depot/grpc-utils";
import { WishlistServiceClient } from "@depot/proto-defs/wishlist";

class WishlistController extends BaseController {
  constructor() {
    const wishlistClient = grpcClientManager.getClient(
      "WISHLIST_SERVICE",
      WishlistServiceClient
    );
    super(wishlistClient);
  }

  addToWishlist = async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return this.sendValidationError(res, {
        id: "Product ID is required",
      });
    }

    await this.executeGrpcCall(
      req,
      res,
      "addToWishlist",
      { id: parseInt(id) },
      {
        transformer: (response) => ({ wishlist: response.wishlist }),
        successMessage: "Product added to wishlist",
        errorMessage: "Failed to add product to wishlist",
        statusCode: 201,
        includeMetadata: true,
      }
    );
  };

  removeFromWishlist = async (req, res) => {
    const id = this.validateId(req, res);
    if (id === null) return;

    await this.executeGrpcCall(
      req,
      res,
      "removeFromWishlist",
      { id },
      {
        transformer: (response) => ({ wishlist: response.wishlist }),
        successMessage: "Product removed from wishlist",
        errorMessage: "Failed to remove product from wishlist",
        includeMetadata: true,
      }
    );
  };

  getWishlist = async (req, res) => {
    await this.executeGrpcCall(
      req,
      res,
      "getWishlist",
      {},
      {
        transformer: (response) => ({ wishlist: response.wishlist || [] }),
        successMessage: "Wishlist fetched successfully",
        errorMessage: "Failed to fetch wishlist",
        includeMetadata: true,
      }
    );
  };
}

export default new WishlistController();
