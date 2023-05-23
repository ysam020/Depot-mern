import express from "express";
import Address from "../../models/addressModel.mjs";

const router = express.Router();

router.post("/:email/address", async (req, res) => {
  const emailId = req.params.email;
  const { name, email, addressLine1, addressLine2, town, zip, state } =
    req.body;

  try {
    // Check if address already exists in the database
    const existingAddress = await Address.findOne({
      email: emailId,
      "address.name": name,
      "address.email": email,
      "address.addressLine1": addressLine1,
      "address.addressLine2": addressLine2,
      "address.town": town,
      "address.zip": zip,
      "address.state": state,
    });

    if (existingAddress) {
      // Return an error response if the address already exists
      return res.status(409).json({ message: "Address already exists" });
    }

    // If the address doesn't exist, add it to the database
    const address = await Address.findOneAndUpdate(
      { email: emailId },
      {
        $push: {
          address: {
            name: name,
            email: email,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            town: town,
            zip: zip,
            state: state,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json(address);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
