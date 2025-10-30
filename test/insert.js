// insertProducts.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://sameer:Ysam24369@localhost:5432/depot",
});

export const products = [
  {
    id: 1,
    title: "TABLE LAMP",
    price: 240,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["White", "Wood"],
    sku: "001",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "White",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-1.jpg",
    rating: 3.9,
    qty: 500,
  },
  {
    id: 2,
    title: "POTTERY VASE",
    price: 60,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["Antique", "Pottery"],
    sku: "002",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Beige",
    material: "Concrete",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h3-product-3.jpg",
    rating: 4.1,
    qty: 500,
  },
  {
    id: 3,
    title: "ROSE HOLDBACK",
    price: 24,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["Decoration", "Rose"],
    sku: "003",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Rose",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-3.jpg",
    rating: 4.7,
    qty: 500,
  },
  {
    id: 4,
    title: "NEWSPAPER STORAGE",
    price: 90,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Basics",
    tags: ["Boxes", "Wood"],
    sku: "004",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Beige",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-4.jpg",
    rating: 2.1,
    qty: 500,
  },
  {
    id: 5,
    title: "WALL CLOCK",
    price: 110,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["Decoration", "Modern"],
    sku: "005",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Black",
    material: "Chrome",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-5.jpg",
    rating: 4.6,
    qty: 500,
  },
  {
    id: 6,
    title: "FLOWERING CACTUS",
    price: 65,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Plants",
    tags: ["Decorative", "Plant"],
    sku: "006",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "White",
    material: "Concrete",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h3-product-3.jpg",
    rating: 3.9,
    qty: 500,
  },
  {
    id: 7,
    title: "FLOWER VASE",
    price: 170,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: "White,Wood",
    sku: "007",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Gold",
    material: "Metal",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-7.jpg",
    rating: 3,
    qty: 500,
  },
  {
    id: 8,
    title: "SHELL COLLECTION",
    price: 25,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Furniture",
    tags: ["Decoration"],
    sku: "008",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "White",
    material: "Steel",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h3-product-4.jpg",
    rating: 1.9,
    qty: 500,
  },
  {
    id: 9,
    title: "MINIMALISTIC CHAIR",
    price: 135,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Furniture",
    tags: ["Boxes", "Wood"],
    sku: "009",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Boxes",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h4-product-25.jpg",
    rating: 3.3,
    qty: 500,
  },
  {
    id: 10,
    title: "LIGHTHOUSE LANTERN",
    price: 135,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Hardwoods",
    tags: ["Wood"],
    sku: "010",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Brown",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h5-product-28.jpg",
    rating: 2.9,
    qty: 500,
  },
  {
    id: 11,
    title: "VIRTUAL PRODUCT",
    price: 350,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Demo Products",
    tags: ["Innovation", "Virtual"],
    sku: "011",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "White",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/02/product-virtual-img.jpg",
    rating: 4.8,
    qty: 500,
  },
  {
    id: 12,
    title: "HELLO",
    price: 210,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Basics",
    tags: ["Pottery", "Modern"],
    sku: "012",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Gray",
    material: "Steel",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/02/h12-product-60.jpg",
    rating: 4.8,
    qty: 500,
  },
  {
    id: 13,
    title: "JAR",
    price: 210,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Accessories",
    tags: ["Decoration", "Rose"],
    sku: "013",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Beige",
    material: "Concrete",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h4-product-20.jpg",
    rating: 2.9,
    qty: 500,
  },
  {
    id: 14,
    title: "BASKET ",
    price: 160,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["Black", "Decorative"],
    sku: "014",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "white",
    material: "wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-8.jpg",
    rating: 2.2,
    qty: 500,
  },
  {
    id: 15,
    title: "DECORATIVE HORSE",
    price: 40,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Accessories",
    tags: ["Decoration", "Wood"],
    sku: "015",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "white",
    material: "wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h4-product-19.jpg",
    rating: 2.6,
    qty: 500,
  },
  {
    id: 16,
    title: "CLEW",
    price: 15,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Accessories",
    tags: ["Decoration"],
    sku: "016",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "white",
    material: "wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h4-product-14.jpg",
    rating: 2.9,
    qty: 500,
  },
  {
    id: 17,
    title: "DECORATIVE ROOSTER",
    price: 40,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Accessories",
    tags: ["Decoration", "Rose"],
    sku: "017",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "white",
    material: "wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h4-product-26.jpg",
    rating: 3.8,
    qty: 500,
  },
  {
    id: 18,
    title: "DOWNLOADABLE PRODUCT",
    price: 45,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["Modern"],
    sku: "018",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Gray",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/downloadable-product-img.jpg",
    rating: 4.7,
    qty: 500,
  },
  {
    id: 19,
    title: "TABLE LAMP",
    price: 240,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["White", "Wood"],
    sku: "019",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "White",
    material: "Wood",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h1-product-1.jpg",
    rating: 3.9,
    qty: 500,
  },
  {
    id: 20,
    title: "POTTERY VASE",
    price: 60,
    shortDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis.",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Vestibulum ultricies aliquam convallis. Maecenas ut tellus mi. Proin tincidunt, lectus eu volutpat mattis, ante metus lacinia tellus, vitae condimentum nulla enim bibendum nibh. Praesent turpis risus, interdum nec venenatis id, pretium sit amet purus. Interdum et malesuada fames.",
    category: "Home Decor",
    tags: ["Antique", "Pottery"],
    sku: "020",
    weight: "2kg",
    dimensions: "10 x 10 x 15 cm",
    color: "Beige",
    material: "Concrete",
    image:
      "https://depot.qodeinteractive.com/wp-content/uploads/2017/01/h3-product-3.jpg",
    rating: 4.1,
    qty: 500,
  },
];

async function seedProducts() {
  try {
    for (const p of products) {
      await pool.query(
        `INSERT INTO products 
          (title, price, short_description, description, category, tags, sku, weight, dimensions, color, material, image, rating, qty)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `,
        [
          p.title,
          p.price,
          p.short_description || p.shortDescription,
          p.description,
          p.category,
          Array.isArray(p.tags) ? p.tags : p.tags.split(","),
          p.sku,
          p.weight,
          p.dimensions,
          p.color,
          p.material,
          p.image,
          p.rating,
          p.qty,
        ]
      );
    }

    console.log("All products inserted successfully!");
  } catch (err) {
    console.error("Error inserting products:", err);
  } finally {
    await pool.end();
  }
}

seedProducts();
