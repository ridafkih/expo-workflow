import { getInput } from "@actions/core";
import { getCwdExecOutput } from "./exec";
import { semverSort } from "./semver";

interface VersionDetails {
  patches: string[];
  latest: string;
}

export const checkout = async (reference: string, install: boolean = true) => {
  await getCwdExecOutput("git", ["checkout", reference]).catch(() => undefined);
  if (install) await getCwdExecOutput("yarn");
};

export const getVersionTags = async () => {
  const stdout = await getCwdExecOutput("git", ["tag", "-l", "v*"]);
  const tags = stdout.split("\n").filter(Boolean).sort(semverSort);

  const versions: Record<string, VersionDetails> = {};

  for (const tag of tags) {
    const [major, minor] = tag.substring(1).split(".");
    const majorMinor = `${major}.${minor}`;

    if (!versions[majorMinor])
      versions[majorMinor] = {
        patches: [tag],
        latest: tag,
      };
    else {
      versions[majorMinor].patches.push(tag);
      versions[majorMinor].latest = tag;
    }
  }

  return versions;
};

export const getLatestCommitMessage = () => {
  return getCwdExecOutput("git", ["log", "-1", "--pretty=format:%s by %aN"]);
};

export const getLastCommitVersionTag = () => {
  return getCwdExecOutput("git", [
    "describe",
    "--exact-match",
    "--match",
    "v[0-9]*.[0-9]*.[0-9]*",
    "HEAD",
  ]).catch(() => undefined);
};

export const configureGit = (
  username: string,
  organizationName: string,
  repositoryName: string
) => {
  return Promise.all([
    getCwdExecOutput("git", [
      "remote",
      "set-url",
      "origin",
      `https://${username}:${getInput(
        "github-token"
      )}@github.com/${organizationName}/${repositoryName}.git`,
    ]),
    getCwdExecOutput("git", [
      "config",
      "--global",
      "user.email",
      '"github-actions[bot]@users.noreply.github.com"',
    ]),
    getCwdExecOutput("git", [
      "config",
      "--global",
      "user.name",
      '"github-actions[bot]"',
    ]),
  ]);
};

export const forcePush = async (branch: string) => {
  await getCwdExecOutput("git", [
    "push",
    "origin",
    branch,
    "--force",
    "--follow-tags",
  ]);
};

export const fetchTags = () => {
  return getCwdExecOutput("git", ["fetch", "--all", "--tags"]).catch(
    () => undefined
  );
};
