import express from "express";
import Wishlist from "../../models/wishlistModel.mjs";

const router = express.Router();

router.post("/:email/wishlist", async (req, res) => {
  const email = req.params.email;
  const { id, price, title, image, rating, shortDescription } = req.body;

  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { email: email },
      {
        $push: {
          product: {
            id: id,
            price: price,
            title: title,
            image: image,
            rating: rating,
            shortDescription: shortDescription,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
