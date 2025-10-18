import express from "express";
import prisma from "../../prisma.mjs";

const router = express.Router();

router.get("/products/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
