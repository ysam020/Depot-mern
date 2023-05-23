import express from "express";
import Wishlist from "../../models/wishlistModel.mjs";

const router = express.Router();

router.get("/:email/wishlist", async (req, res) => {
  const email = req.params.email;

  try {
    const wishlist = await Wishlist.findOne({ email: email });
    const products = wishlist ? wishlist.product || [] : [];

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
