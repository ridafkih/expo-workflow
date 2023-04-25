import { getInput } from "@actions/core";
import { getCwdExecOutput } from "./exec";
import { checkout, getLatestCommitMessage } from "./git";
import type { ExpoConfig } from "@expo/config-types";
import type { AppProfile } from "../types/expo";

interface GetExpoAppConfigOptions {
  gitReference?: string;
  profile: string;
  platform: string;
}

interface GetBuildOptions {
  runtimeVersion?: string;
}

interface FinishedBuild {
  id: string;
  status: "FINISHED";
  platform: "IOS" | "ANDROID";
  appVersion: string;
  runtimeVersion: string;
  artifacts: {
    buildUrl: string;
    applicationArchiveUrl: string;
  };
}

interface EASUpdateOptions {
  type: AppProfile;
}

interface EASBuildOptions {
  profile: string;
  platform: "ios" | "android" | "all";
}

/**
 * Get the Expo app config for a given git reference, profile, and platform.
 * @param options The options for the function.
 * @returns The Expo app config.
 */
export const getExpoAppConfig = async ({
  gitReference,
  profile,
  platform,
}: GetExpoAppConfigOptions) => {
  if (gitReference) {
    await checkout(gitReference);
  }

  const stdout = await getCwdExecOutput("eas", [
    "config",
    `--profile=${profile}`,
    `--platform=${platform}`,
    "--non-interactive",
    "--json",
  ]);

  const { appConfig } = JSON.parse(stdout) as { appConfig: ExpoConfig };
  return appConfig;
};

/**
 * Get the finished builds for a given runtime version.
 * @param options - The options for the function.
 * @returns The list of finished builds.
 */
export const getBuilds = async ({ runtimeVersion }: GetBuildOptions) => {
  const options = ["--status=finished", "--non-interactive", "--json"];
  if (runtimeVersion) {
    options.push(`--runtimeVersion=${runtimeVersion}`);
  }

  const stdout = await getCwdExecOutput("eas", ["build:list", ...options]);
  return JSON.parse(stdout) as FinishedBuild[];
};

/**
 * Update the EAS app with the latest commit message.
 * @param options - The options for the function.
 * @returns The trimmed output from the executed command.
 */
export const easUpdate = async ({ type }: EASUpdateOptions) => {
  const branchName = getInput("branch-name");
  const commitMessageContents = await getLatestCommitMessage();

  return getCwdExecOutput(
    "eas",
    [
      "update",
      `--message`,
      commitMessageContents,
      `--branch=${branchName}`,
      "--non-interactive",
    ],
    { env: { APP_VARIANT: type, ...process.env } }
  );
};

/**
 * Build the EAS app for the specified platform and profile.
 * @param options - The options for the function.
 * @returns The iOS and Android build information.
 */
export const easBuild = async ({ platform, profile }: EASBuildOptions) => {
  const stdout = await getCwdExecOutput("eas", [
    "build",
    `--platform=${platform}`,
    `--profile=${profile}`,
    "--json",
    "--non-interactive",
  ]);

  const builds = JSON.parse(stdout) as FinishedBuild[];

  const ios = builds.find(({ platform }) => platform === "IOS");
  const android = builds.find(({ platform }) => platform === "ANDROID");
  return { ios, android };
};
/**
 * Get compatible builds for the specified app profiles.
 * @param profiles - The app profiles to check compatibility for.
 * @returns The compatible builds, their count, profile, and app configuration.
 * @throws Throws an error if runtimeVersion in the Expo configuration is not a string.
 */
export const getCompatibleBuilds = async (profiles: AppProfile[]) => {
  for (const profile of profiles) {
    const appConfig = await getExpoAppConfig({
      platform: "ios",
      profile,
    });

    if (typeof appConfig.runtimeVersion !== "string") {
      throw Error(
        "runtimeVersion in the Expo configuration must be of type 'string'."
      );
    }

    const builds = await getBuilds({
      runtimeVersion: appConfig.runtimeVersion,
    });
    if (builds.length > 0) {
      return { builds, profile, count: builds.length, appConfig };
    }
  }

  return { builds: [], count: 0, profile: null };
};
