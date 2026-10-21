import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const readme = await readFile(new URL("README.md", root), "utf8");
const expectedPackages = [
  "@llblab/pi-actors",
  "@llblab/pi-claude-usage",
  "@llblab/pi-clean-room",
  "@llblab/pi-codex-usage",
  "@llblab/pi-grow-loop",
  "@llblab/pi-state-flow",
  "@llblab/pi-telegram",
  "@llblab/skills",
];
const expected = manifest.dependencies;
const expectedExtensions = [
  "./extensions/pi-actors/index.js",
  "./extensions/pi-claude-usage/index.ts",
  "./extensions/pi-clean-room/index.ts",
  "./extensions/pi-codex-usage/index.ts",
  "./extensions/pi-grow-loop/index.js",
  "./extensions/pi-state-flow/index.js",
  "./extensions/pi-telegram/index.js",
];
/** Exact bundled entrypoint each pointer must re-export. */
const pointerTargets = {
  "./extensions/pi-actors/index.js": "node_modules/@llblab/pi-actors/dist/pi-actors/index.js",
  "./extensions/pi-claude-usage/index.ts": "node_modules/@llblab/pi-claude-usage/index.ts",
  "./extensions/pi-clean-room/index.ts": "node_modules/@llblab/pi-clean-room/index.ts",
  "./extensions/pi-codex-usage/index.ts": "node_modules/@llblab/pi-codex-usage/index.ts",
  "./extensions/pi-grow-loop/index.js": "node_modules/@llblab/pi-grow-loop/dist/pi-grow-loop/index.js",
  "./extensions/pi-state-flow/index.js": "node_modules/@llblab/pi-state-flow/dist/pi-state-flow/index.js",
  "./extensions/pi-telegram/index.js": "node_modules/@llblab/pi-telegram/dist/pi-telegram/index.js",
};
const expectedSkills = [
  "./node_modules/@llblab/pi-actors/dist/skills",
  "./node_modules/@llblab/pi-grow-loop/dist/skills",
  "./node_modules/@llblab/pi-state-flow/dist/skills",
  "./node_modules/@llblab/pi-telegram/dist/skills",
  "./node_modules/@llblab/skills/",
];

test("package set and resource order are explicit", () => {
  assert.deepEqual(Object.keys(manifest.dependencies), expectedPackages);
  assert.deepEqual(manifest.bundledDependencies, expectedPackages);
  assert.deepEqual(manifest.bundleDependencies, expectedPackages);
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

test("Pi host peers stay outside the kit lockfile", async () => {
  assert.equal(await readFile(new URL(".npmrc", root), "utf8"), "legacy-peer-deps=true\n");
  const lock = JSON.parse(await readFile(new URL("package-lock.json", root), "utf8"));
  for (const name of ["@earendil-works/pi-ai", "@earendil-works/pi-agent-core", "@earendil-works/pi-coding-agent", "@earendil-works/pi-tui", "typebox"]) {
    assert.equal(lock.packages[`node_modules/${name}`], undefined, `${name} is supplied by Pi, not the kit`);
  }
});

test("installed package versions and declared resources match", async () => {
  const declaredSkills = [];
  for (const [name, version] of Object.entries(expected)) {
    const installed = JSON.parse(await readFile(new URL(`node_modules/${name}/package.json`, root), "utf8"));
    assert.equal(installed.version, version, `${name} must resolve to its exact pin`);
    for (const resource of installed.pi?.skills ?? []) {
      declaredSkills.push(`./node_modules/${name}/${resource.replace(/^\.\//, "")}`);
    }
  }
  assert.deepEqual(manifest.pi.skills, declaredSkills);
  for (const resource of [...expectedExtensions, ...expectedSkills]) {
    const url = new URL(resource.replace(/^\.\//, ""), root);
    await assert.doesNotReject(readFileOrDirectory(url), `${resource} must exist`);
  }
});

test("every bundled extension pointer re-exports its exact bundled entrypoint", async () => {
  const installedExtensions = [];
  for (const name of Object.keys(expected)) {
    const installed = JSON.parse(await readFile(new URL(`node_modules/${name}/package.json`, root), "utf8"));
    for (const resource of installed.pi?.extensions ?? []) {
      installedExtensions.push(`node_modules/${name}/${resource.replace(/^\.\//, "")}`);
    }
  }
  // Every resource the pins declare has exactly one pointer, and every pointer has one pin resource.
  assert.deepEqual(
    Object.values(pointerTargets).sort(),
    installedExtensions.sort(),
  );
  for (const [pointer, target] of Object.entries(pointerTargets)) {
    const source = await readFile(new URL(pointer.replace(/^\.\//, ""), root), "utf8");
    const relative = `../../${target}`;
    assert.ok(
      source.includes(`export { default } from "${relative}";`),
      `${pointer} must re-export the default of ${target}`,
    );
    assert.ok(
      source.includes(`export * from "${relative}";`),
      `${pointer} must forward named exports of ${target}`,
    );
    // A pointer is a re-export only: it must not carry a second copy of package source.
    assert.equal(
      source.split("\n").filter((line) => line.startsWith("export ")).length,
      2,
      `${pointer} must hold exactly two re-export statements`,
    );
    await assert.doesNotReject(
      readFileOrDirectory(new URL(relative, new URL(pointer, root))),
      `${target} must exist for ${pointer}`,
    );
  }
});

test("shared Fast is an installed runtime library, not an extra Pi resource", async () => {
  const library = JSON.parse(await readFile(new URL("node_modules/@llblab/pi-command-fast/package.json", root), "utf8"));
  assert.equal(library.name, "@llblab/pi-command-fast");
  assert.equal(library.version, "0.1.0");
  assert.equal(library.pi, undefined);
  await assert.doesNotReject(readFile(new URL("node_modules/@llblab/pi-command-fast/dist/index.js", root)));
  assert.equal(manifest.pi.extensions.some(path => path.includes("pi-command-fast")), false);
  assert.ok(readme.includes("Pi 1.0.0+"));
});

test("published inventory includes the pointer folder", () => {
  assert.ok(manifest.files.includes("extensions/"), "the kit must publish its pointer folder");
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
