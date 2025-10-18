import express from "express";
import prisma from "../../prisma.mjs";
import verifyToken from "../../middlewares/verifyToken.mjs";

const router = express.Router();

router.post("/wishlist", verifyToken, async (req, res) => {
  const { id, price, title, image, rating, shortDescription } = req.body;

  try {
    const email = req.user.email;
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.wishlists.create({
      data: {
        user_id: user.id,
        product_id: id,
      },
    });

    const updatedWishlist = await prisma.wishlists.findMany({
      where: { user_id: user.id },
      include: { product: true },
    });

    return res.status(200).json(updatedWishlist);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
