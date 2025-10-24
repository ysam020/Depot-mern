// import fs from "fs";
// import path from "path";
// import { exec } from "child_process";
// import util from "util";
// import { fileURLToPath } from "url";

// const execAsync = util.promisify(exec);
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// async function getAllProtoFiles(dir) {
//   let results = [];
//   const items = fs.readdirSync(dir);
//   for (const item of items) {
//     const fullPath = path.join(dir, item);
//     const stat = fs.statSync(fullPath);
//     if (stat.isDirectory()) {
//       results = results.concat(await getAllProtoFiles(fullPath));
//     } else if (item.endsWith(".proto")) {
//       results.push(fullPath);
//     }
//   }
//   return results;
// }

// async function generateProtos() {
//   const baseProtoDir = path.resolve(__dirname);
//   const baseGeneratedDir = path.resolve(__dirname, "../proto-gen");

//   if (!fs.existsSync(baseGeneratedDir)) {
//     fs.mkdirSync(baseGeneratedDir, { recursive: true });
//   }

//   const protoFiles = await getAllProtoFiles(baseProtoDir);

//   // ✅ use absolute plugin path from monorepo root
//   const tsProtoPath = path.resolve(
//     __dirname,
//     "../../node_modules/.bin/protoc-gen-ts_proto"
//   );

//   for (const protoFile of protoFiles) {
//     const relativePath = path.relative(baseProtoDir, protoFile);
//     const outputDir = path.join(baseGeneratedDir, path.dirname(relativePath));
//     fs.mkdirSync(outputDir, { recursive: true });

//     // Build the command
//     const command = `
//       /opt/homebrew/bin/protoc \
//       --plugin=protoc-gen-ts_proto=${tsProtoPath} \
//       --ts_proto_out=${outputDir} \
//       --ts_proto_opt=esModuleInterop=true,outputServices=grpc-js,outputClientImpl=true \
//       -I ${baseProtoDir} \
//       ${protoFile}
//     `;

//     try {
//       console.log(`Generating types for ${relativePath}...`);
//       await execAsync(command);
//       console.log(`Successfully generated types for ${relativePath}`);
//     } catch (error) {
//       console.error(
//         `❌ Error generating ${relativePath}:`,
//         error.stderr || error
//       );
//     }
//   }
// }

// generateProtos().catch(console.error);

// packages/proto-defs/src/generate_proto.mjs
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = util.promisify(exec);

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
  console.log("\n🔧 [@depot/proto-defs] Starting proto generation...\n");

  const baseProtoDir = path.resolve(__dirname, "proto");
  const baseGeneratedDir = path.resolve(__dirname, "generated");

  console.log("📁 Proto directory:", baseProtoDir);
  console.log("📁 Output directory:", baseGeneratedDir);

  // Create base generated directory if it doesn't exist
  if (!fs.existsSync(baseGeneratedDir)) {
    fs.mkdirSync(baseGeneratedDir, { recursive: true });
    console.log("✅ Created generated directory\n");
  }

  // Get all proto files recursively
  const protoFiles = await getAllProtoFiles(baseProtoDir);

  if (protoFiles.length === 0) {
    console.error("❌ No proto files found in", baseProtoDir);
    process.exit(1);
  }

  console.log(`📝 Found ${protoFiles.length} proto file(s):`);
  protoFiles.forEach((file) => {
    console.log(`   - ${path.basename(file)}`);
  });

  console.log("\n🔄 Generating TypeScript definitions...\n");

  let successCount = 0;
  let failCount = 0;

  // Generate for each proto file
  for (const protoFile of protoFiles) {
    // Get the relative path from the base proto directory
    const relativePath = path.relative(baseProtoDir, protoFile);
    const baseName = path.basename(protoFile, ".proto");

    process.stdout.write(`⚙️  Processing ${relativePath}... `);

    // Generate types for this proto file - ALL FILES GO TO SAME OUTPUT DIR
    const command = `npx proto-loader-gen-types --longs=String --enums=String --defaults --oneofs --keepCase --grpcLib=@grpc/grpc-js --outDir=${baseGeneratedDir} --proto_path=${baseProtoDir} ${protoFile}`;

    try {
      await execAsync(command);
      console.log("✅");
      successCount++;
    } catch (error) {
      console.log("❌");
      console.error(`\n   Error: ${error.message}`);
      if (error.stderr) {
        // Filter out npm warnings
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

  // List generated files
  if (fs.existsSync(baseGeneratedDir)) {
    const generatedFiles = fs
      .readdirSync(baseGeneratedDir)
      .filter((f) => f.endsWith(".d.ts"));
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
