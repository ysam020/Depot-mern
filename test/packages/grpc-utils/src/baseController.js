import grpc from "@grpc/grpc-js";
import { BaseGrpcService } from "@depot/grpc-utils";
import { getUserIdFromMetadata } from "@depot/grpc-utils";
import prisma from "@depot/prisma";

class BaseServiceController {
  constructor(prismaModel = null, jwtSecret = null) {
    this.prismaModel = prismaModel;
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET;
  }

  async execute(call, callback, handler) {
    await BaseGrpcService.asyncHandler(callback, async () => {
      await handler();
    });
  }

  sendSuccess(callback, ResponseType, data) {
    callback(null, BaseGrpcService.successResponse(ResponseType, data));
  }

  sendError(callback, status, message) {
    return BaseGrpcService.sendError(callback, status, message);
  }

  validateFields(callback, data, requiredFields) {
    return BaseGrpcService.validateAndSendError(callback, data, requiredFields);
  }

  validateField(callback, value, validator, errorMessage) {
    if (!validator(value)) {
      this.sendError(callback, grpc.status.INVALID_ARGUMENT, errorMessage);
      return true;
    }
    return false;
  }

  getUserId(call) {
    try {
      if (!this.jwtSecret) {
        this.logError("JWT_SECRET is not configured");
        return null;
      }
      return getUserIdFromMetadata(call.metadata, this.jwtSecret);
    } catch (err) {
      this.logError("Failed to get user ID from metadata", err);
      return null;
    }
  }

  getUserIdOrFail(call, callback) {
    const userId = this.getUserId(call);

    if (!userId) {
      this.sendError(
        callback,
        grpc.status.UNAUTHENTICATED,
        "Authentication required"
      );
      return null;
    }

    return userId;
  }

  verifyOwnership(callback, resourceUserId, authenticatedUserId) {
    if (resourceUserId !== authenticatedUserId) {
      this.sendError(callback, grpc.status.PERMISSION_DENIED, "Access denied");
      return false;
    }
    return true;
  }

  async findById(id, options = {}) {
    return await this.prismaModel.findUnique({
      where: { id },
      ...options,
    });
  }

  async findByIdOrFail(callback, id, options = {}) {
    const record = await this.findById(id, options);

    if (!record) {
      this.sendError(
        callback,
        grpc.status.NOT_FOUND,
        `${this.getModelName()} not found`
      );
      return null;
    }

    return record;
  }

  async findOne(where, options = {}) {
    return await this.prismaModel.findFirst({
      where,
      ...options,
    });
  }

  async findOneOrFail(callback, where, options = {}) {
    const record = await this.findOne(where, options);

    if (!record) {
      this.sendError(
        callback,
        grpc.status.NOT_FOUND,
        `${this.getModelName()} not found`
      );
      return null;
    }

    return record;
  }

  async findMany(options = {}) {
    return await this.prismaModel.findMany(options);
  }

  async count(where = {}) {
    return await this.prismaModel.count({ where });
  }

  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }

  async checkExistsAndFail(callback, where, message = null) {
    const exists = await this.exists(where);

    if (exists) {
      this.sendError(
        callback,
        grpc.status.ALREADY_EXISTS,
        message || `${this.getModelName()} already exists`
      );
      return true;
    }

    return false;
  }

  async create(data, options = {}) {
    return await this.prismaModel.create({
      data,
      ...options,
    });
  }

  async createMany(data) {
    return await this.prismaModel.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async update(where, data, options = {}) {
    return await this.prismaModel.update({
      where,
      data,
      ...options,
    });
  }

  async updateMany(where, data) {
    return await this.prismaModel.updateMany({
      where,
      data,
    });
  }

  async upsert(where, create, update, options = {}) {
    return await this.prismaModel.upsert({
      where,
      create,
      update,
      ...options,
    });
  }

  async delete(where) {
    return await this.prismaModel.deleteMany({ where });
  }

  async deleteById(id) {
    return await this.prismaModel.delete({
      where: { id },
    });
  }

  async getOrCreate(userId, defaults = {}) {
    let resource = await this.findOne({ user_id: userId });

    if (!resource) {
      resource = await this.create({
        user_id: userId,
        ...defaults,
      });
    }

    return resource;
  }

  async transaction(handler) {
    return await prisma.$transaction(handler);
  }

  async transactionWithErrorHandling(callback, handler) {
    try {
      return await this.transaction(handler);
    } catch (err) {
      console.error("Transaction failed:", err);
      this.sendError(
        callback,
        grpc.status.INTERNAL,
        err.message || "Transaction failed"
      );
      return null;
    }
  }

  buildPaginationOptions(limit = 100, offset = 0, orderBy = {}) {
    return {
      skip: Math.max(0, offset),
      orderBy: orderBy || { created_at: "desc" },
    };
  }

  async findWithPagination(where = {}, limit = 100, offset = 0, options = {}) {
    const [data, total] = await Promise.all([
      this.findMany({
        where,
        ...this.buildPaginationOptions(limit, offset, options.orderBy),
        ...options,
      }),
      this.count(where),
    ]);

    return {
      data,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  getModelName() {
    if (this.prismaModel?.name) {
      return this.prismaModel.name;
    }
    return this.constructor.name.replace("Controller", "");
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  sanitizeObject(obj, fields = ["password"]) {
    if (!obj) return null;

    const sanitized = { ...obj };
    fields.forEach((field) => {
      delete sanitized[field];
    });

    return sanitized;
  }

  extractFields(source, fields) {
    return fields.reduce((acc, field) => {
      if (source[field] !== undefined) {
        acc[field] = source[field];
      }
      return acc;
    }, {});
  }

  parseInt(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  parseFloat(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  formatDate(date) {
    if (date instanceof Date) return date;
    return new Date(date || Date.now());
  }

  log(message, data = null) {
    console.log(`[${this.getModelName()}] ${message}`, data || "");
  }

  logError(message, error = null) {
    console.error(`[${this.getModelName()}] ERROR: ${message}`, error || "");
  }

  async groupCount(where = {}, groupBy) {
    return await this.prismaModel.groupBy({
      by: [groupBy],
      where,
      _count: true,
    });
  }

  async sum(where = {}, field) {
    const result = await this.prismaModel.aggregate({
      where,
      _sum: { [field]: true },
    });
    return result._sum[field] || 0;
  }

  async avg(where = {}, field) {
    const result = await this.prismaModel.aggregate({
      where,
      _avg: { [field]: true },
    });
    return result._avg[field] || 0;
  }

  async min(where = {}, field) {
    const result = await this.prismaModel.aggregate({
      where,
      _min: { [field]: true },
    });
    return result._min[field];
  }

  async max(where = {}, field) {
    const result = await this.prismaModel.aggregate({
      where,
      _max: { [field]: true },
    });
    return result._max[field];
  }
}

export { BaseServiceController };
