import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadProto = (serviceName) => {
  const protoPath = path.resolve(
    __dirname,
    `../proto-defs/${serviceName}.proto`
  );
  const packageDef = protoLoader.loadSync(protoPath);
  return grpc.loadPackageDefinition(packageDef);
};
