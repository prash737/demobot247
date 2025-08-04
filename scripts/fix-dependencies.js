
// This script fixes the unrs-resolver dependency issue
console.log("Running dependency fix script...");

try {
  const fs = require("fs");
  const path = require("path");
  const { execSync } = require("child_process");

  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("node_modules directory not found, skipping fix");
    process.exit(0);
  }

  // Remove problematic packages that cause build timeouts
  const problematicPaths = [
    path.join(nodeModulesPath, "unrs-resolver"),
    path.join(nodeModulesPath, "@napi-rs/simple-git"),
    path.join(nodeModulesPath, ".cache")
  ];

  problematicPaths.forEach(problematicPath => {
    if (fs.existsSync(problematicPath)) {
      console.log(`Removing ${path.basename(problematicPath)}...`);
      fs.rmSync(problematicPath, { recursive: true, force: true });
    }
  });

  // Clear npm cache to prevent conflicts
  try {
    execSync("npm cache clean --force", { stdio: "inherit" });
    console.log("npm cache cleared");
  } catch (cacheError) {
    console.warn("Failed to clear npm cache:", cacheError.message);
  }

  console.log("Successfully applied dependency fix");
} catch (error) {
  console.error("Error fixing dependencies:", error);
  // Don't fail the build if the fix script has an error
  process.exit(0);
}
