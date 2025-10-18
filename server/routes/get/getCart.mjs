import express from "express";
import prisma from "../../prisma.mjs";
import verifyToken from "../../middlewares/verifyToken.mjs";

const router = express.Router();

router.get("/cart", verifyToken, async (req, res) => {
  try {
    const email = req.user.email; // extracted from JWT

    // Find the user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the user's cart and include product details
    const cart = await prisma.carts.findUnique({
      where: { user_id: user.id },
      include: {
        cart_items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If cart doesn't exist, return empty array
    const products = cart
      ? cart.cart_items.map((item) => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity,
        }))
      : [];

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
