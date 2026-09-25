import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const readme = await readFile(new URL("README.md", root), "utf8");
const expected = {
  "@llblab/pi-actors": "0.53.2",
  "@llblab/pi-clean-room": "0.2.0",
  "@llblab/pi-codex-usage": "0.10.0",
  "@llblab/pi-grow-loop": "0.8.2",
  "@llblab/pi-state-flow": "0.21.0",
  "@llblab/pi-telegram": "0.51.5",
  "@llblab/skills": "1.15.0",
};
const expectedExtensions = [
  "./node_modules/@llblab/pi-actors/dist/pi-actors/index.js",
  "./node_modules/@llblab/pi-clean-room/index.ts",
  "./node_modules/@llblab/pi-codex-usage/index.ts",
  "./node_modules/@llblab/pi-grow-loop/dist/pi-grow-loop/index.js",
  "./node_modules/@llblab/pi-state-flow/dist/pi-state-flow/index.js",
  "./node_modules/@llblab/pi-telegram/dist/pi-telegram/index.js",
];
const expectedSkills = [
  "./node_modules/@llblab/pi-actors/dist/skills",
  "./node_modules/@llblab/pi-grow-loop/dist/skills",
  "./node_modules/@llblab/pi-state-flow/dist/skills",
  "./node_modules/@llblab/pi-telegram/dist/skills",
  "./node_modules/@llblab/skills/",
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
    const repository = `https://github.com/llblab/${name.split("/")[1]}`;
    assert.ok(readme.includes(`| [\`${name}\`](${repository}) | \`${version}\` |`));
  }
});

test("installed package versions and declared resources match", async () => {
  const declared = { extensions: [], skills: [] };
  for (const [name, version] of Object.entries(expected)) {
    const installed = JSON.parse(await readFile(new URL(`node_modules/${name}/package.json`, root), "utf8"));
    assert.equal(installed.version, version, `${name} must resolve to its exact pin`);
    for (const kind of Object.keys(declared)) {
      for (const resource of installed.pi?.[kind] ?? []) {
        declared[kind].push(`./node_modules/${name}/${resource.replace(/^\.\//, "")}`);
      }
    }
  }
  assert.deepEqual(manifest.pi.extensions, declared.extensions);
  assert.deepEqual(manifest.pi.skills, declared.skills);
  for (const resource of [...expectedExtensions, ...expectedSkills]) {
    const url = new URL(resource.replace(/^\.\//, ""), root);
    await assert.doesNotReject(readFileOrDirectory(url), `${resource} must exist`);
  }
});

test("package banner is declared and present", async () => {
  assert.equal(manifest.pi.image, "https://raw.githubusercontent.com/llblab/pi-kit/main/banner.jpg");
  assert.ok(manifest.files.includes("banner.jpg"));
  await assert.doesNotReject(readFile(new URL("banner.jpg", root)));
});

test("show-me has one bundled provider", async () => {
  await assert.doesNotReject(readFile(
    new URL("node_modules/@llblab/pi-telegram/dist/skills/show-me/SKILL.md", root),
    "utf8",
  ));
  await assert.rejects(
    readFile(new URL("node_modules/@llblab/skills/show-me/SKILL.md", root), "utf8"),
    { code: "ENOENT" },
  );
});

async function readFileOrDirectory(url) {
  const { stat } = await import("node:fs/promises");
  return stat(url);
}
