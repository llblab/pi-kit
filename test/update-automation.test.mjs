import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { planUpdates, prepareUpdates, synchronizeReadme } from "../scripts/check-updates.mjs";
import { validateCoherence, validatePack } from "../scripts/validate.mjs";

const name = "@llblab/pi-example";
const manifest = {
  name: "@llblab/pi-kit", version: "0.35.4",
  dependencies: { [name]: "0.2.3" },
  bundledDependencies: [name], bundleDependencies: [name],
  pi: { extensions: ["./extensions/pi-example/index.js"], skills: [`./node_modules/${name}/dist/skills`] },
};
const lock = {
  name: manifest.name, version: manifest.version,
  packages: {
    "": { version: manifest.version, dependencies: manifest.dependencies, bundleDependencies: [name] },
    [`node_modules/${name}`]: { version: "0.2.3", inBundle: true },
  },
};
const readme = `| [\`${name}\`](https://github.com/llblab/pi-example) | \`0.2.3\` | Example |\nhttps://github.com/llblab/pi-example/blob/v0.2.3/docs/usage.md\n`;

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "pi-kit-updates-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [file, contents] of Object.entries({
    "package.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "package-lock.json": `${JSON.stringify(lock, null, 2)}\n`,
    "README.md": readme,
    "CHANGELOG.md": "# Changelog\n\nAll notable changes to `@llblab/pi-kit` are documented here.\n\n## 0.35.4: Existing release\n\n- Existing outcome.\n",
  })) await writeFile(join(root, file), contents);
  return root;
}

const options = root => ({ root, lookup: async () => "0.2.4", date: "2026-01-02" });

test("automatic cohorts bump the kit by the highest direct patch/minor change only", () => {
  assert.equal(planUpdates(manifest, { [name]: "0.2.4" }).version, "0.35.5");
  assert.equal(planUpdates(manifest, { [name]: "0.3.0" }).version, "0.36.0");
  const cohort = { ...manifest, dependencies: { ...manifest.dependencies, "@llblab/skills": "1.15.0" } };
  const plan = planUpdates(cohort, { [name]: "0.2.4", "@llblab/skills": "1.16.0" });
  assert.equal(plan.version, "0.36.0");
  assert.equal(plan.updates.length, 2);
  for (const latest of ["0.2.3", "0.2.2", "0.1.9"]) assert.equal(planUpdates(manifest, { [name]: latest }).updates.length, 0);
  for (const latest of ["1.0.0", "0.3.0-beta.1", "latest", "^0.3.0"]) {
    const skipped = planUpdates(manifest, { [name]: latest });
    assert.equal(skipped.updates.length, 0);
    assert.equal(skipped.version, manifest.version);
    assert.equal(skipped.skipped.length, 1);
  }
  assert.throws(() => planUpdates({ ...manifest, dependencies: { [name]: "^0.2.3" } }, { [name]: "0.3.0" }), /stable exact pin/);
});

test("README synchronization is surgical and refuses missing or duplicate inventory rows", () => {
  const updates = [{ name, from: "0.2.3", to: "0.2.4" }];
  const updated = synchronizeReadme(readme, updates);
  assert.ok(updated.includes("| `0.2.4` | Example |"));
  assert.ok(updated.includes("/blob/v0.2.4/docs/usage.md"));
  assert.throws(() => synchronizeReadme("No inventory", updates), /exactly one/);
  assert.throws(() => synchronizeReadme(readme + readme, updates), /exactly one/);
});

test("plan-only and no-update runs leave every tracked artifact untouched and run no installs", async t => {
  const root = await fixture(t);
  const files = ["package.json", "package-lock.json", "README.md", "CHANGELOG.md"];
  const before = await Promise.all(files.map(file => readFile(join(root, file), "utf8")));
  for (const settings of [{ planOnly: true }, { lookup: async () => "0.2.3" }]) {
    const result = await prepareUpdates({ ...options(root), ...settings, run: () => assert.fail("must not install") });
    assert.equal(result.validated, false);
  }
  assert.deepEqual(await Promise.all(files.map(file => readFile(join(root, file), "utf8"))), before);
});

test("a prepared PR has the complete coherent diff and is ready only after install, clean install and validation", async t => {
  const root = await fixture(t);
  const commands = [];
  const result = await prepareUpdates({ ...options(root), run: async (command, args) => {
    commands.push([command, ...args]);
    if (args[0] !== "install") return;
    const updated = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    const regenerated = structuredClone(lock);
    regenerated.version = updated.version;
    regenerated.packages[""].version = updated.version;
    regenerated.packages[""].dependencies = updated.dependencies;
    regenerated.packages[`node_modules/${name}`].version = updated.dependencies[name];
    await writeFile(join(root, "package-lock.json"), `${JSON.stringify(regenerated, null, 2)}\n`);
    validateCoherence(updated, regenerated);
  } });
  assert.deepEqual(commands, [["npm", "install", "--ignore-scripts"], ["npm", "ci", "--ignore-scripts"], ["npm", "run", "validate"]]);
  assert.equal(result.validated, true);
  const updated = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.equal(updated.version, "0.35.5");
  assert.equal(updated.dependencies[name], "0.2.4");
  assert.deepEqual(updated.bundledDependencies, updated.bundleDependencies);
  assert.ok((await readFile(join(root, "README.md"), "utf8")).includes("`0.2.4`"));
  assert.ok((await readFile(join(root, "CHANGELOG.md"), "utf8")).includes("## 0.35.5:"));
  assert.match(result.body, /0\.2\.3` → `0\.2\.4/);
  assert.match(result.body, /releases\/tag\/v0\.2\.4/);
  assert.match(result.body, /npm run validate.*passed/);
  assert.match(result.body, /Why a custom updater, not Dependabot/);
  assert.match(result.body, /human approval/);
});

test("install or validation failure never returns a PR-ready result", async t => {
  for (const failure of ["install", "ci", "run"]) {
    const root = await fixture(t);
    const commands = [];
    await assert.rejects(prepareUpdates({ ...options(root), run: (command, args) => {
      commands.push(args[0]);
      if (args[0] === failure) throw new Error(`failed ${failure}`);
    } }), new RegExp(`failed ${failure}`));
    assert.equal(commands.at(-1), failure);
  }
});

test("coherence rejects ranges, bundle omissions, lock drift and wrong kit versions", () => {
  validateCoherence(manifest, lock);
  for (const mutate of [
    value => { value.dependencies[name] = "^0.2.3"; },
    value => { value.bundledDependencies = []; },
    value => { value.bundleDependencies = []; },
    value => { value.version = "0.35.5"; },
  ]) {
    const changed = structuredClone(manifest);
    mutate(changed);
    assert.throws(() => validateCoherence(changed, lock));
  }
  const changedLock = structuredClone(lock);
  changedLock.packages[`node_modules/${name}`].version = "0.2.4";
  assert.throws(() => validateCoherence(manifest, changedLock));
});

test("packed inventory must contain every bundled manifest, pointer and declared extension/Skill", async t => {
  const root = await fixture(t);
  const installed = join(root, "node_modules", name);
  await mkdir(installed, { recursive: true });
  await writeFile(join(installed, "package.json"), JSON.stringify({ version: "0.2.3", pi: { extensions: ["./dist/index.js"], skills: ["./dist/skills"] } }));
  const paths = ["extensions/pi-example/index.js", `node_modules/${name}/package.json`, `node_modules/${name}/dist/index.js`, `node_modules/${name}/dist/skills/example/SKILL.md`];
  const inventory = files => ({ name: manifest.name, version: manifest.version, files: files.map(path => ({ path })) });
  await validatePack(manifest, inventory(paths), root);
  for (const missing of paths) await assert.rejects(validatePack(manifest, inventory(paths.filter(path => path !== missing)), root), /missing/);
});
