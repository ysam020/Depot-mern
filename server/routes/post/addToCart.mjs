import express from "express";
import prisma from "../../prisma.mjs";
import verifyToken from "../../middlewares/verifyToken.mjs";

const router = express.Router();

router.post("/cart", verifyToken, async (req, res) => {
  const { id: product_id, quantity = 1 } = req.body;

  try {
    // ✅ Extract user email from JWT
    const email = req.user.email;

    // 1️⃣ Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Find or create user's cart
    let cart = await prisma.carts.findUnique({
      where: { user_id: user.id },
      include: { cart_items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: user.id },
      });
    }
    console.log("cart", cart);
    // 3️⃣ Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 4️⃣ Check if product already in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_id,
      },
    });

    let cart_item;

    if (existingItem) {
      // 5️⃣ Update quantity if exists
      cart_item = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      // 6️⃣ Add new item to cart
      cart_item = await prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          product_id,
          quantity,
        },
        include: { product: true },
      });
    }

    // 7️⃣ Return updated cart
    const updated_cart = await prisma.carts.findUnique({
      where: { id: cart.id },
      include: {
        cart_items: { include: { product: true } },
      },
    });

    res.status(200).json({
      message: "Product added to cart successfully",
      cart: updated_cart,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
