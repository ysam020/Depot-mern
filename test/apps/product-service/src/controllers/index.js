import prisma from "@depot/prisma";
import { BaseServiceController } from "@depot/grpc-utils";
import { getProductHandler } from "../handlers/getProduct.handler.js";
import { listProductsHandler } from "../handlers/listProducts.handler.js";

class ProductController extends BaseServiceController {
  constructor() {
    super(prisma.products);
  }

  async findByCategory(category, options = {}) {
    return await this.findMany({
      where: { category },
      ...options,
    });
  }

  async searchProducts(searchTerm, options = {}) {
    return await this.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      ...options,
    });
  }

  async findInStock(options = {}) {
    return await this.findMany({
      where: {
        qty: {
          gt: 0,
        },
      },
      ...options,
    });
  }

  async findByPriceRange(minPrice, maxPrice, options = {}) {
    return await this.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      ...options,
    });
  }

  async isInStock(productId, quantity = 1) {
    const product = await this.findById(productId);
    return product && product.qty >= quantity;
  }

  async updateQuantity(productId, quantity) {
    return await this.update({ id: productId }, { qty: quantity });
  }

  async reduceQuantity(productId, quantity) {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const newQuantity = Math.max(0, product.qty - quantity);
    return await this.updateQuantity(productId, newQuantity);
  }

  async increaseQuantity(productId, quantity) {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const newQuantity = product.qty + quantity;
    return await this.updateQuantity(productId, newQuantity);
  }

  async getProduct(call, callback) {
    await getProductHandler(this, call, callback);
  }

  async listProducts(call, callback) {
    await listProductsHandler(this, call, callback);
  }
}

export default ProductController;
