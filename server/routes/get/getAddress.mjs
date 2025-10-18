import express from "express";
import Address from "../../models/addressModel.mjs";

const router = express.Router();

router.get("/:email/address", async (req, res) => {
  const email = req.params.email;

  try {
    const address = await Address.findOne({ email: email }, { _id: 0, __v: 0 });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json(address.address);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
