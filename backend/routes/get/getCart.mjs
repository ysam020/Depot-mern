import express from "express";
import Cart from "../../models/cartModel.mjs";

const router = express.Router();

router.get("/:email/cart", async (req, res) => {
  const email = req.params.email;

  try {
    const cart = await Cart.findOne({ email: email });
    // if cart is falsy, set products to an empty array
    const products = cart ? cart.product || [] : [];

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
