import express from "express";
import bcrypt from "bcrypt";
import User from "../../models/userModel.mjs";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            res.json({ message: "Login Successfull", user: user });
          } else {
            res.json({ message: "Password didn't match" });
          }
        });
      } else {
        res.json({ message: "User not registered" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({ message: "Something went wrong" });
    });
});

export default router;
