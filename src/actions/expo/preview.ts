import { readFileSync } from "fs";
import { join } from "path";
import {
  checkout,
  configureGit,
  fetchTags,
  forcePush,
  getLastCommitVersionTag,
  getVersionTags,
} from "../../utils/git";
import { checkReferencesDependencies } from "../../utils/dependency-hash";
import { incrementVersion } from "../../utils/npm";
import { getCwdExecOutput } from "../../utils/exec";
import { easBuild, easUpdate } from "../../utils/expo";
import { context } from "@actions/github";
import { getInput } from "@actions/core";

const handleNonMatchingVersions = async (
  versionTags: Awaited<ReturnType<typeof getVersionTags>>,
  version: string
) => {
  const [major, minor] = version.split(".");
  const majorMinor = `${major}.${minor}`;

  const { patches = [] } = versionTags?.[majorMinor] ?? {};

  if (patches.length === 0) {
    Promise.allSettled([
      easUpdate({ type: "development", updateBranchName: "main" }),
      easBuild({ platform: "all", profile: "development" }),
    ]);

    return;
  }

  const isMostRecentPatch = patches[patches.length - 1] === `v${version}`;

  if (!isMostRecentPatch) {
    throw Error(
      "You can only apply a patch to the most recent patch in the patch set. Please ensure you are updating the latest patch."
    );
  }

  await getCwdExecOutput("git", ["stash"]);

  await configureGit(
    getInput("github-username"),
    getInput("organization-name"),
    getInput("repository-name")
  );

  const patchVersion = await incrementVersion("patch");
  await easUpdate({ type: "development", updateBranchName: "main" });

  await checkout("main");
  await getCwdExecOutput("git", [
    "merge",
    patchVersion,
    "-X",
    "ours",
    "-m",
    `Merge tag ${patchVersion}`,
    "--allow-unrelated-histories",
  ]);

  await incrementVersion("patch");
  await easUpdate({ type: "development", updateBranchName: "main" });

  await forcePush("main").catch(() => undefined);
};

export const main = async () => {
  await fetchTags();

  const lastCommitVersionTag = await getLastCommitVersionTag();
  if (lastCommitVersionTag) return;

  await getCwdExecOutput("git", ["pull", "--all"]);
  const versionTags = await getVersionTags();
  const tags = Object.entries(versionTags);
  const [majorMinor, { latest }] = tags[tags.length - 1];

  await checkout("main");
  await getCwdExecOutput("git", ["log"]);
  const firstNonMergeCommit = await getCwdExecOutput("git", [
    "log",
    "--no-merges",
    "-n",
    "1",
    "--pretty=format:%H",
  ]);

  await checkout(firstNonMergeCommit);

  const { version } = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf-8")
  );

  const isLatestVersionDifferent = latest.slice(1) !== version;
  const isVersionMajorMinorMatch = version.startsWith(majorMinor);
  const isVersionMismatch =
    isLatestVersionDifferent && isVersionMajorMinorMatch;

  if (isVersionMismatch) {
    throw Error(
      "The current version does not match the latest version and has an unexpected major-minor combination."
    );
  }

  if (isLatestVersionDifferent) {
    return handleNonMatchingVersions(versionTags, version);
  }

  const isPatch = await checkReferencesDependencies({
    gitReferences: [latest, context.sha],
  });

  await getCwdExecOutput("git", ["stash"]);
  await checkout("main", false);

  await configureGit(
    getInput("github-username"),
    getInput("organization-name"),
    getInput("repository-name")
  );

  await incrementVersion(isPatch ? "patch" : "minor");
  await forcePush("main").catch(() => undefined);

  easUpdate({ type: "development", updateBranchName: "main" });
  if (!isPatch) easBuild({ platform: "all", profile: "development" });
};

main();
