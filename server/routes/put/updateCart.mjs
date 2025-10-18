import express from "express";
import prisma from "../../prisma.mjs";
import verifyToken from "../../middlewares/verifyToken.mjs";

const router = express.Router();

router.put("/cart/:productId", verifyToken, async (req, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  try {
    const email = req.user.email;

    // Find the user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find user's cart
    const cart = await prisma.carts.findUnique({ where: { user_id: user.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Update quantity of the cart item
    await prisma.cart_items.updateMany({
      where: { cart_id: cart.id, product_id: productId },
      data: { quantity: quantity },
    });

    // Fetch updated cart items with product details
    const updatedCart = await prisma.cart_items.findMany({
      where: { cart_id: cart.id },
      include: { product: true },
    });

    const products = updatedCart.map((item) => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
