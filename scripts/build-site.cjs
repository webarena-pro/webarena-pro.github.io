const fs = require("node:fs");
const path = require("node:path");
const { validateSubmission, toLeaderboardEntry } = require("../submission-schema.js");
const projectRoot = path.resolve(__dirname, "..");
const marker = '<script type="application/json" id="accepted-submissions">[]</script>';

function readSubmissions(root = projectRoot) {
  const directory = path.join(root, "submissions");
  const records = [];
  for (const name of fs.readdirSync(directory).sort()) {
    if (name === "README.md") continue;
    const file = path.join(directory, name);
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || !name.endsWith(".json") || stat.size > 65536) {
      throw new Error(`submissions/${name}: expected a regular JSON file no larger than 64 KiB.`);
    }
    let record;
    try { record = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (error) { throw new Error(`submissions/${name}: ${error.message}`); }
    const errors = validateSubmission(record);
    if (errors.length) throw new Error(`submissions/${name}: ${errors.join(" ")}`);
    if (name !== `${record.id}.json`) {
      throw new Error(`submissions/${name}: filename must match the record id (${record.id}.json).`);
    }
    records.push(record);
  }
  return records;
}

function buildSite(root = projectRoot, output = path.join(root, "_site")) {
  const records = readSubmissions(root);
  const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (source.split(marker).length !== 2) throw new Error("Missing or duplicate accepted-submissions placeholder.");
  // Escape '<' so submitted text cannot end the JSON script tag in the HTML.
  const json = JSON.stringify(records.map(toLeaderboardEntry)).replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, "index.html"), source.replace(marker,
    () => `<script type="application/json" id="accepted-submissions">${json}</script>`));
  for (const name of ["submit.html", "styles.css", "script.js", "submission.js", "submission-schema.js"]) {
    fs.copyFileSync(path.join(root, name), path.join(output, name));
  }
  fs.rmSync(path.join(output, "assets"), { recursive: true, force: true });
  fs.cpSync(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
  return records.length;
}

if (require.main === module) {
  try { console.log(`Built _site with ${buildSite()} accepted submission(s).`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { readSubmissions, buildSite };
