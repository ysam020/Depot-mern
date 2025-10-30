import BaseController from "./base.js";
import { grpcClientManager } from "@depot/grpc-utils";
import { ProductServiceClient } from "@depot/proto-defs/product";

class ProductController extends BaseController {
  constructor() {
    const productClient = grpcClientManager.getClient(
      "PRODUCT_SERVICE",
      ProductServiceClient
    );
    super(productClient);
  }

  listProducts = async (req, res) => {
    const { limit, offset } = this.extractPagination(req, {
      limit: 100,
      offset: 0,
    });

    await this.executeGrpcCall(
      req,
      res,
      "listProducts",
      { limit, offset },
      {
        transformer: (response) => ({
          products: response.products || [],
          total: response.total,
          limit,
          offset,
        }),
        successMessage: "Products fetched successfully",
        errorMessage: "Failed to fetch products",
      }
    );
  };

  getProduct = async (req, res) => {
    const id = this.validateId(req, res);
    if (id === null) return;

    await this.executeGrpcCall(
      req,
      res,
      "getProduct",
      { id },
      {
        transformer: (response) => ({ product: response.product }),
        successMessage: "Product fetched successfully",
        errorMessage: "Failed to fetch product",
        notFoundCheck: (response) => !response?.product,
        notFoundMessage: "Product not found",
      }
    );
  };
}

export default new ProductController();
