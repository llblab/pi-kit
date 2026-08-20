import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const readme = await readFile(new URL("README.md", root), "utf8");
const expected = {
  "@llblab/pi-actors": "0.49.1",
  "@llblab/pi-codex-usage": "0.9.3",
  "@llblab/pi-grow-loop": "0.7.2",
  "@llblab/pi-telegram": "0.36.7",
};
const expectedExtensions = [
  "./node_modules/@llblab/pi-actors/dist/pi-actors/index.js",
  "./node_modules/@llblab/pi-codex-usage/index.ts",
  "./node_modules/@llblab/pi-grow-loop/index.ts",
  "./node_modules/@llblab/pi-telegram/index.ts",
];
const expectedSkills = [
  "./node_modules/@llblab/pi-actors/dist/skills",
  "./node_modules/@llblab/pi-grow-loop/skills",
  "./node_modules/@llblab/pi-telegram/skills",
];

test("package set and resource order are explicit", () => {
  assert.deepEqual(manifest.dependencies, expected);
  assert.deepEqual(manifest.bundledDependencies, Object.keys(expected));
  assert.deepEqual(manifest.pi.extensions, expectedExtensions);
  assert.deepEqual(manifest.pi.skills, expectedSkills);
});

test("pins are exact and the public inventory matches", () => {
  for (const [name, version] of Object.entries(expected)) {
    assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    assert.ok(readme.includes(`| \`${name}\` | \`${version}\` |`));
  }
});

test("installed package versions and declared resources match", async () => {
  for (const [name, version] of Object.entries(expected)) {
    const installed = JSON.parse(await readFile(new URL(`node_modules/${name}/package.json`, root), "utf8"));
    assert.equal(installed.version, version, `${name} must resolve to its exact pin`);
  }
  for (const resource of [...expectedExtensions, ...expectedSkills]) {
    const url = new URL(resource.replace(/^\.\//, ""), root);
    await assert.doesNotReject(readFileOrDirectory(url), `${resource} must exist`);
  }
});

async function readFileOrDirectory(url) {
  const { stat } = await import("node:fs/promises");
  return stat(url);
}
