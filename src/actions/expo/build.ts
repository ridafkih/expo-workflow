import { getInput } from "@actions/core";
import {
  easBuild,
  getCompatibleBuilds,
  getExpoAppConfig,
} from "../../utils/expo";
import { getMessage } from "../../utils/sticky-message";

interface BuildOptions {
  status: string;
  branchName: string;
  version: string;
  runtimeVersion: string;
  iosBuildId?: string;
  androidBuildId?: string;
}

const makePlatformFilter = (platform: "IOS" | "ANDROID") => {
  return (item: unknown) => {
    if (!item || typeof item !== "object") return false;
    if (!("platform" in item) || !("buildProfile" in item)) return false;

    return (
      item.platform === platform &&
      (item.buildProfile === "artifact" || item.buildProfile === "development")
    );
  };
};

const buildTable = ({
  status,
  branchName,
  version,
  runtimeVersion,
  iosBuildId,
  androidBuildId,
}: BuildOptions): string => {
  const iosLink = iosBuildId
    ? `[iOS](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/${iosBuildId})`
    : "";
  const androidLink = androidBuildId
    ? `[Android](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/${androidBuildId})`
    : "";

  return `
    | **Status** | **Branch** | **Version** | **Runtime Version** | Download |
    |-|-|-|-|-|
    | ${status} | ${branchName} | ${version} | ${runtimeVersion} | ${iosLink} / ${androidLink} |
  `;
};

export const main = async () => {
  const branchName = getInput("branch-name");

  const comment = await getMessage(
    "build",
    `**When a build artifact compatible with this pull request is found, the information to download it will be placed here. If a compatible build cannot be found, it will be created. In the meantime, you can check builds [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds)**

    Hang tight while a build is found, or generated.
    `
  );

  const { builds, count } = await getCompatibleBuilds([
    "development",
    "artifact",
  ]);

  const iosBuilds = builds.filter(makePlatformFilter("IOS"));
  const androidBuilds = builds.filter(makePlatformFilter("ANDROID"));

  if (iosBuilds.length === 0 || androidBuilds.length === 0) {
    const { version, runtimeVersion } = await getExpoAppConfig({
      profile: "artifact",
      platform: "ios",
    });

    if (!version)
      throw Error(
        "Something has gone wrong, and the `version` in the Expo configuration cannot be found."
      );

    if (!runtimeVersion || typeof runtimeVersion !== "string")
      throw Error(
        "Something has gone wrong, and the `runtimeVersion` in the Expo configuration cannot be found, or it is not a string."
      );

    await comment.update(`
      **A native change has been detected, an artifact for this branch is being generated and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

      ${buildTable({
        status: "Building ⏳",
        branchName,
        version,
        runtimeVersion,
      })}
    `);

    const build = await easBuild({ platform: "all", profile: "artifact" });

    await comment.update(`
      **A native change has been detected, an artifact for this branch has been generated and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

      ${buildTable({
        status: "Complete ✅",
        branchName,
        version,
        runtimeVersion,
        iosBuildId: build.ios?.id,
        androidBuildId: build.android?.id,
      })}
    `);

    return;
  }

  const [ios] = iosBuilds;
  const [android] = androidBuilds;

  await comment.update(`
    **A compatible artifact for this branch has been found and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

    ${buildTable({
      status: "Found 🔍",
      branchName,
      version: ios?.appVersion,
      runtimeVersion: ios?.runtimeVersion,
      iosBuildId: ios?.id,
      androidBuildId: android?.id,
    })}
  `);
};

main();
