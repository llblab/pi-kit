import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function validateCoherence(manifest, lock) {
  const names = Object.keys(manifest.dependencies);
  assert.ok(names.length > 0, "the kit must declare its package set");
  assert.deepEqual(manifest.bundledDependencies, names, "bundledDependencies must match dependencies in order");
  assert.deepEqual(manifest.bundleDependencies, names, "both npm bundle aliases must agree");
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version, "lockfile version must match the kit");
  assert.equal(lock.packages[""].version, manifest.version);
  assert.deepEqual(lock.packages[""].dependencies, manifest.dependencies);
  assert.deepEqual(lock.packages[""].bundleDependencies, names);
  for (const [name, version] of Object.entries(manifest.dependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, `${name} must have an exact version`);
    assert.equal(lock.packages[`node_modules/${name}`]?.version, version, `${name} lock must match its pin`);
    assert.equal(lock.packages[`node_modules/${name}`]?.inBundle, true, `${name} must be bundled`);
  }
}

export async function validatePack(manifest, inventory, root) {
  assert.equal(inventory.name, manifest.name);
  assert.equal(inventory.version, manifest.version);
  const paths = new Set(inventory.files.map(file => file.path));
  for (const resource of manifest.pi.extensions) {
    assert.ok(paths.has(resource.replace(/^\.\//, "")), `packed extension pointer missing: ${resource}`);
  }
  for (const name of manifest.bundledDependencies) {
    const prefix = `node_modules/${name}/`;
    assert.ok(paths.has(`${prefix}package.json`), `packed package missing: ${name}`);
    const installed = JSON.parse(await readFile(resolve(root, prefix, "package.json"), "utf8"));
    assert.equal(installed.version, manifest.dependencies[name]);
    for (const resource of installed.pi?.extensions ?? []) {
      assert.ok(paths.has(`${prefix}${resource.replace(/^\.\//, "")}`), `packed entrypoint missing: ${name}/${resource}`);
    }
    for (const resource of installed.pi?.skills ?? []) {
      const directory = `${prefix}${resource.replace(/^\.\//, "").replace(/\/$/, "")}`.replace(/\/$/, "");
      assert.ok([...paths].some(path => path.startsWith(`${directory}/`) && path.endsWith("SKILL.md")), `packed Skills missing: ${name}/${resource}`);
    }
    console.log(`Packed ${name}@${installed.version}: manifest and declared resources present`);
  }
}

async function main() {
  const root = process.cwd();
  const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
  validateCoherence(manifest, lock);
  if (process.argv.includes("--pack")) {
    const [inventory] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], { cwd: root, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }));
    await validatePack(manifest, inventory, root);
    console.log(`Validated ${inventory.files.length} packed files for ${manifest.name}@${manifest.version}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
