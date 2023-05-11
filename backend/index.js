import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const uri =
  "mongodb+srv://ysam020:ysam24369@depot.swnzl1q.mongodb.net/depot?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");

    const userSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        trim: true,
      },
    });

    const productSchema = new mongoose.Schema({
      id: Number,
      title: String,
      price: Number,
      shortDescription: String,
      description: String,
      category: String,
      tags: Array,
      sku: String,
      weight: String,
      dimensions: String,
      color: String,
      material: String,
      image: String,
      rating: Object,
      qty: Number,
    });

    const cartSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      product: {
        type: [productSchema],
        default: [],
      },
    });

    const wishlistSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      product: {
        type: [productSchema],
        default: [],
      },
    });

    const addressSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      address: {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          required: true,
          trim: true,
        },
        addressLine1: {
          type: String,
          required: true,
          trim: true,
        },
        addressLine2: {
          type: String,
          trim: true,
        },
        town: {
          type: String,
          required: true,
          trim: true,
        },
        zip: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
      },
    });

    addressSchema.index(
      {
        email: 1,
        "address.name": 1,
        "address.email": 1,
        "address.addressLine1": 1,
        "address.town": 1,
        "address.zip": 1,
        "address.state": 1,
      },
      { unique: true }
    );

    const User = new mongoose.model("User", userSchema);
    const Product = new mongoose.model("Product", productSchema);
    const Cart = new mongoose.model("Cart", cartSchema);
    const Wishlist = new mongoose.model("Wishlist", wishlistSchema);
    const Address = new mongoose.model("Address", addressSchema);

    // Routes
    // Login
    app.post("/login", (req, res) => {
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

    // Register
    app.post("/register", (req, res) => {
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

    // Get products
    app.get("/products", async (req, res) => {
      try {
        const products = await Product.find({});
        res.json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    // Get single product
    app.get("/products/:id", async (req, res) => {
      try {
        const productId = req.params.id;
        const product = await Product.findOne({ id: productId });
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    });

    // Add product to cart
    app.post("/:email/cart", async (req, res) => {
      const email = req.params.email;
      const { id, price, title, image, qty } = req.body;

      try {
        const cart = await Cart.findOneAndUpdate(
          { email: email },
          {
            $push: {
              product: {
                id: id,
                price: price,
                title: title,
                image: image,
                qty: qty,
              },
            },
          },
          { upsert: true, new: true }
        );

        res.status(200).json(cart);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    });

    // Get cart state from db
    app.get("/:email/cart", async (req, res) => {
      const email = req.params.email;

      try {
        const cart = await Cart.findOne({ email: email });
        // if cart is falsy, set products to an empty array
        const products = cart ? cart.product || [] : [];

        res.status(200).json(products);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    });

    // Delete product from cart
    app.delete("/:email/cart/:id", async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;

      try {
        const cart = await Cart.findOneAndUpdate(
          { email: email },
          { $pull: { product: { id: id } } },
          { new: true }
        );

        res.status(200).json(cart);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    });

    // Update product qty in cart
    app.put("/:email/cart/:id", async (req, res) => {
      const email = req.params.email;
      const productId = req.params.id;
      const { qty } = req.body;

      try {
        const cart = await Cart.findOneAndUpdate(
          { email: email, "product.id": productId },
          {
            $set: {
              "product.$.qty": qty,
            },
          },
          { new: true }
        );

        res.status(200).json(cart);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    });

    // Add product to wishlist
    app.post("/:email/wishlist", async (req, res) => {
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

    // Get wishlist state from db
    app.get("/:email/wishlist", async (req, res) => {
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

    // Delete product from wishlist
    app.delete("/:email/wishlist/:id", async (req, res) => {
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

    // Add address to db
    app.post("/:email/address", async (req, res) => {
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

    // Get address from db
    app.get("/:email/address", async (req, res) => {
      const email = req.params.email;

      try {
        const address = await Address.findOne(
          { email: email },
          { _id: 0, __v: 0 }
        );

        if (!address) {
          return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json(address.address);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    });

    // Delete address from db
    app.delete("/:email/address", async (req, res) => {
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

    app.listen(9002, () => {
      console.log("BE started at port 9002");
    });
  })
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));
