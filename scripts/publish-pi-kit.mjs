import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout } from "node:timers/promises";
import { validateCoherence } from "./validate.mjs";

function execute(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, ...options }).trim();
}

export async function releaseState(root = process.cwd()) {
  const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
  validateCoherence(manifest, lock);
  assert.equal(manifest.name, "@llblab/pi-kit");
  assert.notEqual(manifest.private, true);
  assert.match(manifest.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "kit releases require a stable exact version");
  const tag = `v${manifest.version}`;
  const tags = execute("git", ["tag", "-l", "v*"], { cwd: root });
  const sorted = execute("sort", ["-V"], { input: tags }).split("\n").filter(Boolean);
  const latestTag = sorted.at(-1) ?? "";
  if (tag === latestTag) return { publish: false, tag, version: manifest.version, latestTag };
  assert.ok(!sorted.includes(tag), `${tag} already exists; tags must never be overwritten`);
  if (latestTag) {
    const ordered = execute("sort", ["-V"], { input: `${latestTag}\n${tag}\n` }).split("\n");
    assert.equal(ordered.at(-1), tag, `${tag} is older than the latest tag ${latestTag}`);
  }
  return { publish: true, tag, version: manifest.version, latestTag };
}

export function verifyExistingPublication({ tagCommit, headCommit, published, version }) {
  assert.equal(tagCommit, headCommit, "existing release tag must point at the current HEAD");
  assert.equal(published.version, version, "npm must contain the exact version");
  assert.equal(published.gitHead, headCommit, "existing npm version must belong to the current HEAD");
}

export function publishNpm({ manifest, run = execute } = {}) {
  const tag = `v${manifest.version}`;
  const headCommit = run("git", ["rev-parse", "HEAD^{commit}"]);
  const tagCommit = run("git", ["rev-parse", `refs/tags/${tag}^{commit}`]);
  assert.equal(tagCommit, headCommit, "publish only the validated, tagged HEAD");
  try {
    console.log(run("npm", ["publish", "--access", "public"]));
    return { alreadyPublished: false };
  } catch (error) {
    const log = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    console.error(log);
    if (!/EPUBLISHCONFLICT|cannot publish over (?:the )?previously published versions|version[^\n]*already exists/i.test(log)) throw error;
    const published = JSON.parse(run("npm", ["view", `${manifest.name}@${manifest.version}`, "--json", "version", "gitHead", "--prefer-online"]));
    verifyExistingPublication({ tagCommit, headCommit, published, version: manifest.version });
    console.log(`${manifest.name}@${manifest.version} already exists at the tagged HEAD; treating publication as successful.`);
    return { alreadyPublished: true };
  }
}

export function verifyPackedPublication(local, remote, published, headCommit) {
  assert.equal(published.version, local.version);
  assert.equal(published.gitHead, headCommit, "public npm gitHead must match the release commit");
  assert.equal(remote.name, local.name);
  assert.equal(remote.version, local.version);
  const paths = inventory => inventory.files.map(file => file.path).sort();
  assert.deepEqual(paths(remote), paths(local), "public npm inventory must match the validated local package");
  assert.ok(paths(remote).includes("package.json"));
}

async function verifyPublicPackage(manifest) {
  const [local] = JSON.parse(execute("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"]));
  const headCommit = execute("git", ["rev-parse", "HEAD^{commit}"]);
  for (let attempt = 1; attempt <= 120; attempt++) {
    try {
      const published = JSON.parse(execute("npm", ["view", `${manifest.name}@${manifest.version}`, "--json", "version", "gitHead", "--prefer-online"]));
      const [remote] = JSON.parse(execute("npm", ["pack", `${manifest.name}@${manifest.version}`, "--dry-run", "--ignore-scripts", "--json", "--prefer-online"]));
      verifyPackedPublication(local, remote, published, headCommit);
      console.log("Public npm identity and packed inventory match the validated release.");
      return;
    } catch (error) {
      if (attempt === 120) throw error;
      console.error(`Public registry verification pending (${attempt}/120): ${error.message}`);
      await setTimeout(5_000);
    }
  }
}

async function main() {
  const command = process.argv[2];
  if (command === "check") {
    const state = await releaseState();
    console.log(state.publish ? `Release required: ${state.tag} (latest tag: ${state.latestTag || "none"}).` : `${state.tag} is already the latest tag; nothing to publish.`);
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `publish=${state.publish}\nversion=${state.version}\ntag=${state.tag}\n`);
    return;
  }
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  if (command === "publish") publishNpm({ manifest });
  else if (command === "verify") await verifyPublicPackage(manifest);
  else throw new Error("Usage: node scripts/publish-pi-kit.mjs check|publish|verify");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
