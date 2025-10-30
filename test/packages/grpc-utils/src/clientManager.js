import grpc from "@grpc/grpc-js";

class GrpcClientManager {
  constructor() {
    this.clients = new Map();
    this.credentials = grpc.credentials.createInsecure();
  }

  getClient(serviceName, ClientClass) {
    if (!this.clients.has(serviceName)) {
      const address = process.env[`${serviceName}_ADDRESS`];

      if (!address) {
        throw new Error(
          `${serviceName}_ADDRESS is not configured in environment variables`
        );
      }

      const client = new ClientClass(address, this.credentials);
      this.clients.set(serviceName, client);
      console.log(`Initialized ${serviceName} client at ${address}`);
    }

    return this.clients.get(serviceName);
  }

  static createMetadata(req) {
    const metadata = new grpc.Metadata();

    if (req.headers.authorization) {
      metadata.add("authorization", req.headers.authorization);
    }

    if (req.headers["x-request-id"]) {
      metadata.add("x-request-id", req.headers["x-request-id"]);
    }

    return metadata;
  }

  closeAll() {
    this.clients.forEach((client, serviceName) => {
      if (client.close) {
        client.close();
        console.log(`Closed ${serviceName} client`);
      }
    });
    this.clients.clear();
  }
}

export const grpcClientManager = new GrpcClientManager();
export { GrpcClientManager };
