import express from "express";
import WishlistController from "../controllers/wishlist.js";

const router = express.Router();

router.post("/", WishlistController.addToWishlist);

router.delete("/:id", WishlistController.removeFromWishlist);

router.get("/", WishlistController.getWishlist);

export default router;
