import { readFileSync } from "fs";
import { join } from "path";
import { getInput } from "@actions/core";
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

const handleNonMatchingVersions = async (
  versionTags: Awaited<ReturnType<typeof getVersionTags>>,
  majorMinor: string,
  version: string
) => {
  const { patches } = versionTags[majorMinor];
  const isMostRecentPatch = patches[patches.length - 1] === `v${version}`;

  if (!isMostRecentPatch) {
    throw Error(
      "You can only apply a patch to the most recent patch in the patch set. Please ensure you are updating the latest patch."
    );
  }

  await getCwdExecOutput("git", ["stash"]);
  await configureGit();

  const patchVersion = await incrementVersion("patch");

  await checkout("main", false);
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

  await forcePush("main").catch(() => undefined);
};

export const main = async () => {
  await fetchTags();

  const lastCommitVersionTag = await getLastCommitVersionTag();
  if (lastCommitVersionTag) return;

  const versionTags = await getVersionTags();
  const tags = Object.entries(versionTags);
  const [majorMinor, { latest }] = tags[tags.length - 1];

  const head = getInput("head");
  await checkout(head);

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
    await handleNonMatchingVersions(versionTags, majorMinor, version);
    return;
  }

  const isPatch = await checkReferencesDependencies({
    gitReferences: [latest, head],
  });

  await getCwdExecOutput("git", ["stash"]);
  await configureGit();
  await incrementVersion(isPatch ? "patch" : "minor");
  await forcePush("main").catch(() => undefined);

  if (isPatch)
    return easUpdate({ type: "development", updateBranchName: "main" });

  easBuild({ platform: "ios", profile: "development" });
};

main();
