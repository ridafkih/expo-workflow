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

  if (count === 0) {
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

    const build = await easBuild({ platform: "ios", profile: "artifact" });

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

  const [ios] = builds.filter((build) => build.platform === "IOS");
  const [android] = builds.filter((build) => build.platform === "ANDROID");

  await comment.update(`
    **A compatible artifact for this branch has been found and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

    ${buildTable({
      status: "Found 🔍",
      branchName,
      version: ios.appVersion,
      runtimeVersion: ios.runtimeVersion,
      iosBuildId: ios?.id,
      androidBuildId: android?.id,
    })}
  `);
};

main();
