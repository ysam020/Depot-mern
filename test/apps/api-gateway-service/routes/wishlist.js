import express from "express";
import { WishlistServiceClient } from "@depot/proto-defs/wishlist";
import { jwtMiddleware } from "../middlewares/auth.js";
import {
  grpcClientManager,
  GrpcClientManager,
  GrpcErrorHandler,
  ResponseFormatter,
} from "@depot/grpc-utils";

const router = express.Router();

// Get gRPC client
const wishlistClient = grpcClientManager.getClient(
  "WISHLIST_SERVICE",
  WishlistServiceClient
);

// Apply JWT middleware
router.use(jwtMiddleware);

// Add to wishlist
router.post("/", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return ResponseFormatter.validationError(res, {
      id: "Product ID is required",
    });
  }

  wishlistClient.addToWishlist(
    { id: parseInt(id) },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { wishlist: response.wishlist },
          "Product added to wishlist"
        );
      },
      "Failed to add product to wishlist"
    )
  );
});

// Remove from wishlist
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return ResponseFormatter.validationError(res, {
      id: "Product ID is required",
    });
  }

  wishlistClient.removeFromWishlist(
    { id: parseInt(id) },
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { wishlist: response.wishlist },
          "Product removed from wishlist"
        );
      },
      "Failed to remove product from wishlist"
    )
  );
});

// Get wishlist
router.get("/", (req, res) => {
  wishlistClient.getWishlist(
    {},
    GrpcClientManager.createMetadata(req),
    GrpcErrorHandler.wrapCallback(
      res,
      (response) => {
        ResponseFormatter.success(
          res,
          { wishlist: response.wishlist || [] },
          "Wishlist fetched successfully"
        );
      },
      "Failed to fetch wishlist"
    )
  );
});

export default router;
