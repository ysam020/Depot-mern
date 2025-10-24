// import grpc from "@grpc/grpc-js";
// import protoLoader from "@grpc/proto-loader";
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export const loadProto = (serviceName) => {
//   const protoPath = path.resolve(
//     __dirname,
//     `../proto-defs/${serviceName}.proto`
//   );
//   const packageDef = protoLoader.loadSync(protoPath);
//   return grpc.loadPackageDefinition(packageDef);
// };

// packages/grpc-utils/loadProto.js (already exists, but let's verify)
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

  const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true, // ✅ Keep snake_case
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDef);
};
