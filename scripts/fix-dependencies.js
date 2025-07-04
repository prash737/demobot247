// This script fixes the unrs-resolver dependency issue
console.log("Running dependency fix script...")

try {
  const fs = require("fs")
  const path = require("path")

  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), "node_modules")
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("node_modules directory not found, skipping fix")
    process.exit(0)
  }

  // Check if unrs-resolver exists
  const unrsPath = path.join(nodeModulesPath, "unrs-resolver")
  if (fs.existsSync(unrsPath)) {
    console.log("Found unrs-resolver, applying fix...")

    // Remove the problematic package
    fs.rmSync(unrsPath, { recursive: true, force: true })

    // Install the replacement package
    const { execSync } = require("child_process")
    execSync("npm install @napi-rs/simple-git@^0.18.0 --no-save", { stdio: "inherit" })

    console.log("Successfully applied dependency fix")
  } else {
    console.log("unrs-resolver not found, no fix needed")
  }
} catch (error) {
  console.error("Error fixing dependencies:", error)
  // Don't fail the build if the fix script has an error
  process.exit(0)
}
