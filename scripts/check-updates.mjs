import { execFileSync } from "node:child_process";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateCoherence } from "./validate.mjs";

function stableVersion(version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) return null;
  return version.split(".").map(Number);
}

export function planUpdates(manifest, candidates) {
  const updates = [];
  const skipped = [];
  for (const [name, from] of Object.entries(manifest.dependencies)) {
    if (!/^@llblab\/[a-z0-9-]+$/.test(name)) throw new Error(`Unexpected package owner: ${name}`);
    const current = stableVersion(from);
    const to = candidates[name];
    const next = stableVersion(to);
    if (!current) throw new Error(`Automatic updates require a stable exact pin: ${name}@${from}`);
    if (!next) {
      skipped.push(`${name}: latest ${to} is not a stable exact version; review manually.`);
      continue;
    }
    const difference = next.findIndex((part, index) => part !== current[index]);
    if (difference < 0 || next[difference] < current[difference]) continue;
    if (next[0] !== current[0]) {
      skipped.push(`${name}: major update ${from} → ${to} requires manual preparation.`);
      continue;
    }
    updates.push({ name, from, to });
  }
  const version = stableVersion(manifest.version);
  if (!version) throw new Error(`The kit must have a stable exact version: ${manifest.version}`);
  const minor = updates.some(({ from, to }) => stableVersion(from)[1] !== stableVersion(to)[1]);
  const nextVersion = !updates.length ? manifest.version : minor
    ? `${version[0]}.${version[1] + 1}.0`
    : `${version[0]}.${version[1]}.${version[2] + 1}`;
  return { updates, skipped, version: nextVersion };
}

export function synchronizeReadme(readme, updates) {
  for (const { name, from, to } of updates) {
    const repository = `https://github.com/llblab/${name.split("/")[1]}`;
    const cell = `| [\`${name}\`](${repository}) | \`${from}\` |`;
    if (readme.split(cell).length !== 2) throw new Error(`Expected exactly one README inventory row for ${name}@${from}`);
    readme = readme.replace(cell, `| [\`${name}\`](${repository}) | \`${to}\` |`);
    readme = readme.replaceAll(`${repository}/blob/v${from}/`, `${repository}/blob/v${to}/`);
  }
  return readme;
}

export function pullRequestBody(plan, previousVersion, validated) {
  const packages = plan.updates.map(({ name, from, to }) => {
    const repository = `https://github.com/llblab/${name.split("/")[1]}`;
    return `| \`${name}\` | \`${from}\` → \`${to}\` | [Release](${repository}/releases/tag/v${to}) · [Compare](${repository}/compare/v${from}...v${to}) |`;
  });
  return [
    "## Prepared dependency update",
    "",
    `Kit: \`${previousVersion}\` → \`${plan.version}\`. Package membership, pointer targets and resource order are unchanged; incompatible resource changes fail validation instead of being guessed.`,
    "",
    "| Package | Exact pin | Upstream review |",
    "| --- | --- | --- |",
    ...packages,
    "",
    "## Why a custom updater, not Dependabot?",
    "",
    "Direct npm registry discovery prepares one coherent review cohort: exact pins, both bundle aliases, a regenerated lockfile, the README inventory, kit version and changelog. Dependabot alone does not synchronize those kit-owned artifacts. No extra updater dependency, direct main commit or auto-merge is used.",
    "",
    "## Validation",
    "",
    validated
      ? "`npm install --ignore-scripts`, then `npm ci --ignore-scripts` and `npm run validate` passed, including bundle/resource inventory checks. Dependency lifecycle scripts were disabled. This is packaging evidence, not a security or live-client approval."
      : "Plan only: installation and validation have NOT run; this report must not be used to open a ready PR.",
    ...(plan.skipped.length ? ["", "## Manual follow-up", "", ...plan.skipped.map(item => `- ${item}`)] : []),
    "",
    "## Maintainer review (required)",
    "",
    "See [Security](https://github.com/llblab/pi-kit/blob/main/README.md#security) and [Update automation](https://github.com/llblab/pi-kit/blob/main/README.md#update-automation).",
    "",
    "- [ ] Read every upstream release/changelog and compare; investigate breaking changes, especially pre-1.0 minor releases.",
    "- [ ] Review source and new transitive dependencies, install hooks, workers and auxiliary-file resolution from import.meta.url; extensions run with the user's permissions.",
    "- [ ] Check exact pins, both bundle aliases, lock integrity, README versions, kit bump and changelog; confirm no unreviewed capabilities or resources were added.",
    "- [ ] Inspect successful validation logs and packed inventory; run any required isolated runtime/client smoke checks.",
    "- [ ] Obtain a human approval and merge manually. Automation is not a safety decision; do not enable auto-merge.",
    "",
  ].join("\n");
}

async function latestVersion(name) {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`npm registry lookup failed for ${name}: HTTP ${response.status}`);
  const metadata = await response.json();
  if (metadata.name !== name || typeof metadata.version !== "string") throw new Error(`Invalid npm metadata for ${name}`);
  return metadata.version;
}

export async function prepareUpdates({ root = process.cwd(), lookup = latestVersion, run, planOnly = false, date = new Date().toISOString().slice(0, 10) } = {}) {
  const read = async file => readFile(resolve(root, file), "utf8");
  const manifest = JSON.parse(await read("package.json"));
  validateCoherence(manifest, JSON.parse(await read("package-lock.json")));
  const candidates = Object.fromEntries(await Promise.all(Object.keys(manifest.dependencies).map(async name => [name, await lookup(name)])));
  const plan = planUpdates(manifest, candidates);
  console.log(JSON.stringify(plan, null, 2));
  if (planOnly || !plan.updates.length) return { ...plan, validated: false, body: pullRequestBody(plan, manifest.version, false) };
  const previousVersion = manifest.version;
  const readme = synchronizeReadme(await read("README.md"), plan.updates);
  const changelog = await read("CHANGELOG.md");
  const heading = "All notable changes to `@llblab/pi-kit` are documented here.\n";
  if (!changelog.includes(heading)) throw new Error("Unrecognized CHANGELOG.md structure");
  const summary = plan.updates.map(({ name, from, to }) => `\`${name}\` ${from} → ${to}`).join("; ");
  const release = `\n## ${plan.version}: Bundled Package Updates (${date})\n\n- \`Exact pins\`: ${summary}.\n- \`Packaging\`: Synchronizes the lockfile, bundle aliases and README inventory. Package membership and resource order remain unchanged; packed validation does not certify extension safety or installed-client behavior.\n`;
  manifest.version = plan.version;
  for (const { name, to } of plan.updates) manifest.dependencies[name] = to;
  manifest.bundledDependencies = Object.keys(manifest.dependencies);
  manifest.bundleDependencies = [...manifest.bundledDependencies];
  await writeFile(resolve(root, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(resolve(root, "README.md"), readme);
  await writeFile(resolve(root, "CHANGELOG.md"), changelog.replace(heading, `${heading}${release}`));
  const execute = run ?? ((command, args) => execFileSync(command, args, { cwd: root, stdio: "inherit" }));
  await execute("npm", ["install", "--ignore-scripts"]);
  await execute("npm", ["ci", "--ignore-scripts"]);
  await execute("npm", ["run", "validate"]);
  return { ...plan, validated: true, body: pullRequestBody(plan, previousVersion, true) };
}

async function main() {
  const result = await prepareUpdates({ planOnly: process.argv.includes("--plan") });
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, result.body);
  if (process.env.PR_BODY_PATH) await writeFile(process.env.PR_BODY_PATH, result.body);
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${result.validated}\ndate=${new Date().toISOString().slice(0, 10)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
