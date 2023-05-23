import express from "express";
import Cart from "../../models/cartModel.mjs";

const router = express.Router();

router.put("/:email/cart/:id", async (req, res) => {
  const email = req.params.email;
  const productId = req.params.id;
  const { qty } = req.body;

  try {
    const cart = await Cart.findOneAndUpdate(
      { email: email, "product.id": productId },
      {
        $set: {
          "product.$.qty": qty,
        },
      },
      { new: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
