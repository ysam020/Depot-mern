import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { fileURLToPath } from "url";

const execAsync = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getAllProtoFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(await getAllProtoFiles(fullPath));
    } else if (item.endsWith(".proto")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function generateProtos() {
  const baseProtoDir = path.resolve(__dirname);
  const baseGeneratedDir = path.resolve(__dirname, "../proto-gen");

  if (!fs.existsSync(baseGeneratedDir)) {
    fs.mkdirSync(baseGeneratedDir, { recursive: true });
  }

  const protoFiles = await getAllProtoFiles(baseProtoDir);

  // ✅ use absolute plugin path from monorepo root
  const tsProtoPath = path.resolve(
    __dirname,
    "../../node_modules/.bin/protoc-gen-ts_proto"
  );

  for (const protoFile of protoFiles) {
    const relativePath = path.relative(baseProtoDir, protoFile);
    const outputDir = path.join(baseGeneratedDir, path.dirname(relativePath));
    fs.mkdirSync(outputDir, { recursive: true });

    // Build the command
    const command = `
      /opt/homebrew/bin/protoc \
      --plugin=protoc-gen-ts_proto=${tsProtoPath} \
      --ts_proto_out=${outputDir} \
      --ts_proto_opt=esModuleInterop=true,outputServices=grpc-js,outputClientImpl=true \
      -I ${baseProtoDir} \
      ${protoFile}
    `;

    try {
      console.log(`🧩 Generating types for ${relativePath}...`);
      await execAsync(command);
      console.log(`✅ Successfully generated types for ${relativePath}`);
    } catch (error) {
      console.error(
        `❌ Error generating ${relativePath}:`,
        error.stderr || error
      );
    }
  }
}

generateProtos().catch(console.error);
