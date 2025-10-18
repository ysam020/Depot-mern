import express from "express";
import Wishlist from "../../models/wishlistModel.mjs";

const router = express.Router();

router.delete("/:email/wishlist/:id", async (req, res) => {
  const email = req.params.email;
  const id = req.params.id;

  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { email: email },
      { $pull: { product: { id: id } } },
      { new: true }
    );

    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
