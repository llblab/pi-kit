import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { publishNpm, releaseState, verifyExistingPublication, verifyOidcEnvironment, verifyPackedPublication } from "../scripts/publish-pi-kit.mjs";

const manifest = {
  name: "@llblab/pi-kit", version: "0.35.4",
  dependencies: { "@llblab/example": "1.0.0" },
  bundledDependencies: ["@llblab/example"], bundleDependencies: ["@llblab/example"],
};
const lock = {
  name: manifest.name, version: manifest.version,
  packages: {
    "": { version: manifest.version, dependencies: manifest.dependencies, bundleDependencies: manifest.bundleDependencies },
    "node_modules/@llblab/example": { version: "1.0.0", inBundle: true },
  },
};

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "pi-kit-publish-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  const setVersion = async version => {
    const nextLock = structuredClone(lock);
    nextLock.version = version;
    nextLock.packages[""].version = version;
    await writeFile(join(root, "package.json"), JSON.stringify({ ...manifest, version }));
    await writeFile(join(root, "package-lock.json"), JSON.stringify(nextLock));
  };
  git("init", "--initial-branch=release-test");
  await setVersion(manifest.version);
  git("add", "package.json", "package-lock.json");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "Fixture release");
  return { root, git, setVersion };
}

test("an unchanged latest version exits zero on a real test branch without publishing", async t => {
  const { root, git } = await fixture(t);
  git("tag", "v0.35.3");
  git("tag", "v0.35.4");
  assert.equal((await releaseState(root)).publish, false);
  const output = join(root, "github-output");
  const message = execFileSync(process.execPath, [fileURLToPath(new URL("../scripts/publish-pi-kit.mjs", import.meta.url)), "check"], { cwd: root, encoding: "utf8", env: { ...process.env, GITHUB_OUTPUT: output } });
  assert.match(message, /nothing to publish/);
  assert.match(await readFile(output, "utf8"), /publish=false\nversion=0\.35\.4\ntag=v0\.35\.4/);
  assert.equal(git("tag", "-l", "v*", "--sort=version:refname"), "v0.35.3\nv0.35.4");
});

test("new releases use version sorting, support the first release, and never downgrade or overwrite tags", async t => {
  const { root, git, setVersion } = await fixture(t);
  assert.equal((await releaseState(root)).publish, true);
  git("tag", "v0.9.0");
  git("tag", "v0.10.0");
  assert.equal((await releaseState(root)).latestTag, "v0.10.0");
  await setVersion("0.36.0");
  assert.equal((await releaseState(root)).tag, "v0.36.0");
  await setVersion("0.9.0");
  await assert.rejects(releaseState(root), /already exists/);
  await setVersion("0.9.1");
  await assert.rejects(releaseState(root), /older than/);
});

test("OIDC preflight requires a supported npm and the exact hosted main-workflow identity", () => {
  const env = {
    GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", GITHUB_REPOSITORY: "llblab/pi-kit",
    GITHUB_REF: "refs/heads/main", GITHUB_WORKFLOW_REF: "llblab/pi-kit/.github/workflows/publish-pi-kit.yml@refs/heads/main",
    ACTIONS_ID_TOKEN_REQUEST_URL: "https://example.invalid/oidc", ACTIONS_ID_TOKEN_REQUEST_TOKEN: "fixture-only",
  };
  for (const version of ["11.5.1", "11.19.0", "12.0.0"]) verifyOidcEnvironment(env, version);
  for (const version of ["10.9.0", "11.4.9", "11.5.0", "12.0.0-beta.1"]) assert.throws(() => verifyOidcEnvironment(env, version));
  for (const key of Object.keys(env)) assert.throws(() => verifyOidcEnvironment({ ...env, [key]: "" }, "11.19.0"));
  for (const changed of [
    { RUNNER_ENVIRONMENT: "self-hosted" },
    { GITHUB_REF: "refs/tags/v0.35.5" },
    { GITHUB_REPOSITORY: "other/pi-kit" },
    { GITHUB_WORKFLOW_REF: "llblab/pi-kit/.github/workflows/release.yml@refs/heads/main" },
  ]) assert.throws(() => verifyOidcEnvironment({ ...env, ...changed }, "11.19.0"));
});

test("the publisher requests OIDC instead of npm secrets and preflights before any tag", async () => {
  const workflow = await readFile(new URL("../.github/workflows/publish-pi-kit.yml", import.meta.url), "utf8");
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /runs-on: ubuntu-latest/);
  assert.ok(!workflow.includes("NPM_TOKEN"));
  assert.ok(!workflow.includes("NODE_AUTH_TOKEN"));
  const preflight = workflow.indexOf("run: node scripts/publish-pi-kit.mjs preflight");
  const tag = workflow.indexOf('git tag "$TAG"');
  assert.ok(preflight > 0 && tag > preflight);
  assert.ok(workflow.indexOf("run: npm run validate") < tag);
  assert.ok(tag < workflow.indexOf("run: node scripts/publish-pi-kit.mjs publish"));
  assert.ok(!workflow.includes("npm stage publish"), "staging is not a silent fallback for denied direct publication");
});

test("version conflicts are successful only for the exact tagged commit and npm identity", () => {
  const identity = { tagCommit: "same-head", headCommit: "same-head", published: { version: "0.35.4", gitHead: "same-head" }, version: "0.35.4" };
  verifyExistingPublication(identity);
  for (const changed of [
    { tagCommit: "other-head" },
    { published: { version: "0.35.3", gitHead: "same-head" } },
    { published: { version: "0.35.4", gitHead: "other-head" } },
    { published: { version: "0.35.4" } },
  ]) assert.throws(() => verifyExistingPublication({ ...identity, ...changed }));
});

test("publication uses the required command and catches only an actual already-published error", () => {
  const calls = [];
  const run = (command, args) => {
    calls.push([command, ...args]);
    if (command === "git") return "same-head";
    if (args[0] === "view") return JSON.stringify({ version: manifest.version, gitHead: "same-head" });
    return "Published";
  };
  assert.equal(publishNpm({ manifest, run }).alreadyPublished, false);
  assert.deepEqual(calls.at(-1), ["npm", "publish", "--access", "public"]);
  for (const message of ["EPUBLISHCONFLICT", "You cannot publish over the previously published versions: 0.35.4.", "version 0.35.4 already exists"]) {
    const conflict = Object.assign(new Error("npm rejected publication"), { stderr: message });
    const rejectPublish = (command, args) => {
      if (command === "npm" && args[0] === "publish") throw conflict;
      return run(command, args);
    };
    assert.equal(publishNpm({ manifest, run: rejectPublish }).alreadyPublished, true);
  }
  for (const message of ["E403 Invalid token", "E500 registry unavailable", "EOTP authentication required", "E_STAGE_REQUIRED stage-only publisher"]) {
    const failure = Object.assign(new Error(message), { stderr: message });
    assert.throws(() => publishNpm({ manifest, run: (command, args) => {
      if (command === "npm" && args[0] === "publish") throw failure;
      return run(command, args);
    } }), failure);
  }
  assert.throws(() => publishNpm({ manifest, run: (command, args) => command === "git" ? (args[1].startsWith("refs/") ? "other-head" : "same-head") : assert.fail("must not publish") }), /tagged HEAD/);
});

test("public artifact verification rejects contradictory npm identity or packed inventory", () => {
  const inventory = { name: manifest.name, version: manifest.version, files: [{ path: "package.json" }, { path: "node_modules/@llblab/example/package.json" }] };
  const published = { version: manifest.version, gitHead: "same-head" };
  verifyPackedPublication(inventory, inventory, published, "same-head");
  assert.throws(() => verifyPackedPublication(inventory, { ...inventory, files: [{ path: "package.json" }] }, published, "same-head"));
  assert.throws(() => verifyPackedPublication(inventory, inventory, { ...published, gitHead: "other-head" }, "same-head"));
  assert.throws(() => verifyPackedPublication(inventory, { ...inventory, version: "0.35.3" }, published, "same-head"));
});
