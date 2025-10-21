import express from "express";
import grpc from "@grpc/grpc-js";
import { WishlistServiceClient } from "../../../dist/wishlist.js";
import { jwtMiddleware } from "../middlewares/auth.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const router = express.Router();
const WISHLIST_SERVICE_ADDRESS = process.env.WISHLIST_SERVICE_ADDRESS;

const wishlistClient = new WishlistServiceClient(
  WISHLIST_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

// Helper to attach JWT to gRPC metadata
function createMetadata(req) {
  const metadata = new grpc.Metadata();
  if (req.headers.authorization) {
    metadata.add("authorization", req.headers.authorization);
  }
  return metadata;
}

// Apply JWT middleware to all routes
router.use(jwtMiddleware);

// Add to wishlist
router.post("/", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Product ID is required",
    });
  }

  wishlistClient.addToWishlist(
    { id: parseInt(id) },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Add to wishlist error:", err);

        // Handle specific gRPC error codes
        if (err.code === grpc.status.ALREADY_EXISTS) {
          return res.status(409).json({
            success: false,
            error: "Product already in wishlist",
          });
        }

        if (err.code === grpc.status.UNAUTHENTICATED) {
          return res.status(401).json({
            success: false,
            error: "Authentication required",
          });
        }

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: response.wishlist,
        message: "Product added to wishlist",
      });
    }
  );
});

// Remove from wishlist
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Product ID is required",
    });
  }

  wishlistClient.removeFromWishlist(
    { id: parseInt(id) },
    createMetadata(req),
    (err, response) => {
      if (err) {
        console.error("Remove from wishlist error:", err);

        if (err.code === grpc.status.NOT_FOUND) {
          return res.status(404).json({
            success: false,
            error: "Wishlist not found",
          });
        }

        if (err.code === grpc.status.UNAUTHENTICATED) {
          return res.status(401).json({
            success: false,
            error: "Authentication required",
          });
        }

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: response.wishlist,
        message: "Product removed from wishlist",
      });
    }
  );
});

// Get wishlist
router.get("/", (req, res) => {
  wishlistClient.getWishlist(
    {}, // Empty request object since GetWishlistRequest is empty
    createMetadata(req), // JWT is passed in metadata
    (err, response) => {
      if (err) {
        console.error("Get wishlist error:", err);

        if (err.code === grpc.status.UNAUTHENTICATED) {
          return res.status(401).json({
            success: false,
            error: "Authentication required",
          });
        }

        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      // response.wishlist is the array from proto
      res.json({
        success: true,
        data: response.wishlist || [],
        message: "Wishlist fetched successfully",
      });
    }
  );
});

export default router;
