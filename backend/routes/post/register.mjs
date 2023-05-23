import express from "express";
import bcrypt from "bcrypt";
import User from "../../models/userModel.mjs";

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.send({ message: "User already registered" });
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            res.send(err);
          } else {
            const user = new User({
              name,
              email,
              password: hashedPassword,
            });
            user
              .save()
              .then(() => {
                res.send({
                  message: "Successfully registered, login now.",
                });
              })
              .catch((err) => {
                res.send(err);
              });
          }
        });
      }
    })
    .catch((err) => {
      res.send(err);
    });
});

export default router;
