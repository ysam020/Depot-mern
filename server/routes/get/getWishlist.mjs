import express from "express";
import prisma from "../../prisma.mjs";
import verifyToken from "../../middlewares/verifyToken.mjs";

const router = express.Router();

router.get("/wishlist", verifyToken, async (req, res) => {
  try {
    const email = req.user.email;

    // Find user by email
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get wishlist items along with product details
    const wishlistItems = await prisma.wishlists.findMany({
      where: { user_id: user.id },
      include: { product: true },
    });

    // Format the response to include product info
    const wishlist = wishlistItems.map((item) => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category,
      qty: item.product.qty,
    }));

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
