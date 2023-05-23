import express from "express";
import Cart from "../../models/cartModel.mjs";

const router = express.Router();

router.delete("/:email/cart/:id", async (req, res) => {
  const email = req.params.email;
  const id = req.params.id;

  try {
    const cart = await Cart.findOneAndUpdate(
      { email: email },
      { $pull: { product: { id: id } } },
      { new: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
