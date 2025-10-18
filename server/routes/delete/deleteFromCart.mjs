import express from "express";
import prisma from "../../prisma.mjs";
import verifyToken from "../../middlewares/verifyToken.mjs";

const router = express.Router();

router.delete("/cart/:productId", verifyToken, async (req, res) => {
  const productId = parseInt(req.params.productId);

  try {
    const email = req.user.email;

    // Find the user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find user's cart
    const cart = await prisma.carts.findUnique({
      where: { user_id: user.id },
    });

    if (!cart)
      return res.status(404).json({ message: "Cart not found for this user" });

    // Delete the cart item
    await prisma.cart_items.deleteMany({
      where: {
        cart_id: cart.id,
        product_id: productId,
      },
    });

    // Return updated cart items
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
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
