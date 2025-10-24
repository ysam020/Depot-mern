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
  console.log(
    "\n🔧 [@depot/proto-defs] Starting proto generation with ts-proto...\n"
  );

  const baseProtoDir = path.resolve(__dirname, "proto");
  const baseGeneratedDir = path.resolve(__dirname, "generated");

  console.log("📁 Proto directory:", baseProtoDir);
  console.log("📁 Output directory:", baseGeneratedDir);

  if (!fs.existsSync(baseGeneratedDir)) {
    fs.mkdirSync(baseGeneratedDir, { recursive: true });
    console.log("✅ Created generated directory\n");
  }

  const protoFiles = await getAllProtoFiles(baseProtoDir);

  if (protoFiles.length === 0) {
    console.error("❌ No proto files found in", baseProtoDir);
    process.exit(1);
  }

  console.log(`📝 Found ${protoFiles.length} proto file(s):`);
  protoFiles.forEach((file) => {
    console.log(`   - ${path.basename(file)}`);
  });

  // ✅ FIX: Try multiple possible locations for ts-proto
  const possiblePaths = [
    path.resolve(__dirname, "../../node_modules/.bin/protoc-gen-ts_proto"), // In proto-defs
    path.resolve(__dirname, "../../../node_modules/.bin/protoc-gen-ts_proto"), // In monorepo root
  ];

  let tsProtoPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      tsProtoPath = p;
      break;
    }
  }

  if (!tsProtoPath) {
    console.error("❌ protoc-gen-ts_proto not found!");
    console.error("   Please install: npm install --save-dev ts-proto");
    process.exit(1);
  }

  console.log("🔌 Using ts-proto plugin:", tsProtoPath);
  console.log("\n🔄 Generating TypeScript code...\n");

  let successCount = 0;
  let failCount = 0;

  for (const protoFile of protoFiles) {
    const relativePath = path.relative(baseProtoDir, protoFile);

    process.stdout.write(`⚙️  Processing ${relativePath}... `);

    const command = `protoc \
  --plugin=protoc-gen-ts_proto=${tsProtoPath} \
  --ts_proto_out=${baseGeneratedDir} \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_opt=outputClientImpl=grpc-js \
  --ts_proto_opt=env=node \
  --ts_proto_opt=useOptionals=messages \
  --ts_proto_opt=useSnakeCasing=false \
  --ts_proto_opt=snakeToCamel=false \
  --ts_proto_opt=initializeFieldsAsUndefined=false \
  --ts_proto_opt=useProtoFieldDefaultValues=true \
  --proto_path=${baseProtoDir} \
  ${protoFile}`;

    try {
      const { stderr } = await execAsync(command);

      if (
        stderr &&
        !stderr.includes("Unknown") &&
        !stderr.includes("npm warn") &&
        !stderr.includes("warning: Import")
      ) {
        console.error("\n", stderr);
      }

      console.log("✅");
      successCount++;
    } catch (error) {
      console.log("❌");
      console.error(`\n   Error: ${error.message}`);
      if (error.stderr) {
        const errorLines = error.stderr
          .split("\n")
          .filter(
            (line) =>
              !line.includes("Unknown") &&
              !line.includes("npm warn") &&
              line.trim()
          )
          .join("\n");
        if (errorLines) {
          console.error("   ", errorLines);
        }
      }
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  if (failCount === 0) {
    console.log(`✅ All ${successCount} proto file(s) generated successfully!`);
  } else {
    console.log(`⚠️  ${successCount} succeeded, ${failCount} failed`);
  }
  console.log("=".repeat(50) + "\n");

  if (fs.existsSync(baseGeneratedDir)) {
    const generatedFiles = fs
      .readdirSync(baseGeneratedDir)
      .filter((f) => f.endsWith(".ts"));
    if (generatedFiles.length > 0) {
      console.log("📦 Generated files:");
      generatedFiles.forEach((file) => {
        const filePath = path.join(baseGeneratedDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`   ✓ ${file} (${size} KB)`);
      });
    }
  }

  console.log("\n🎉 Proto generation complete!\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

generateProtos().catch((error) => {
  console.error("\n❌ Generation failed:", error.message);
  console.error(error);
  process.exit(1);
});
