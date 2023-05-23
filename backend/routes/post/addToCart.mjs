import express from "express";
import Cart from "../../models/cartModel.mjs";

const router = express.Router();

router.post("/:email/cart", async (req, res) => {
  const email = req.params.email;
  const { id, price, title, image, qty } = req.body;

  try {
    const cart = await Cart.findOneAndUpdate(
      { email: email },
      {
        $push: {
          product: {
            id: id,
            price: price,
            title: title,
            image: image,
            qty: qty,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
