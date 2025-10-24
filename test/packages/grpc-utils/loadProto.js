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

// packages/grpc-utils/loadProto.js
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadProto = (protoName) => {
  // ✅ Correct path structure
  const protoPath = path.resolve(
    __dirname,
    `../proto-defs/src/proto/${protoName}.proto` // ✅ /src/proto/
  );

  const protoDir = path.resolve(
    __dirname,
    "../proto-defs/src/proto" // ✅ /src/proto/
  );

  const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [protoDir],
  });

  return grpc.loadPackageDefinition(packageDef);
};
