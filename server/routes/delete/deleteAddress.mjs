import express from "express";
import Address from "../../models/addressModel.mjs";

const router = express.Router();

router.delete("/:email/address", async (req, res) => {
  const emailId = req.params.email;
  const { name, email, addressLine1, addressLine2, town, zip, state } =
    req.body;

  try {
    const address = await Address.findOneAndUpdate(
      {
        email: emailId,
        "address.name": name,
        "address.email": email,
        "address.addressLine1": addressLine1,
        "address.addressLine2": addressLine2,
        "address.town": town,
        "address.zip": zip,
        "address.state": state,
      },
      {
        $pull: {
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
      { new: true }
    );

    if (!address) {
      // Return an error response if the address is not found
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json(address);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
