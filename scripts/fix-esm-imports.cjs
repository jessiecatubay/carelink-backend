const fs = require("fs");
const path = require("path");

const distDir = path.resolve("dist");

function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
      continue;
    }

    if (!entry.name.endsWith(".js")) {
      continue;
    }

    let content = fs.readFileSync(fullPath, "utf8");

    content = content.replace(
      /(\b(?:from\s+|import\s*\(\s*|import\s+))(["'])(\.\.?\/[^"']+)(\2)/g,
      (match, prefix, quote, importPath) => {
        if (
          importPath.endsWith(".js") ||
          importPath.endsWith(".json") ||
          importPath.endsWith(".node")
        ) {
          return match;
        }

        return `${prefix}${quote}${importPath}.js${quote}`;
      }
    );

    fs.writeFileSync(fullPath, content, "utf8");
  }
}

processDirectory(distDir);

console.log("Fixed ESM import extensions in dist/");