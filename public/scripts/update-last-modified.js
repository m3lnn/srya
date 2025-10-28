// update-last-modified.js
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

try {
  // Get latest commit date
  const lastCommitDate = execSync("git log -1 --format=%cd --date=iso")
    .toString()
    .trim();

  // Format for CET
  const formattedDate = new Date(lastCommitDate).toLocaleString("en-US", {
    timeZone: "Europe/Berlin",
    hour12: true,
  });

  // Read your HTML
  const html = readFileSync("index.html", "utf8");

  // Replace only the content inside <span class="last-updated">…</span>
  const updatedHtml = html.replace(
    /(<span class="last-updated">)(.*?)(<\/span>)/,
    `$1${formattedDate}$3`
  );

  writeFileSync("index.html", updatedHtml);
  console.log("✅ Updated timestamp:", formattedDate);
} catch (error) {
  console.error("❌ Error updating timestamp:", error);
  process.exit(1);
}
