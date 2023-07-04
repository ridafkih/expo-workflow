import type { ExpoConfig } from "@expo/config-types";
import type { AppProfile } from "../types/expo";
interface GetExpoAppConfigOptions {
    gitReference?: string;
    profile: string;
    platform: string;
}
interface GetBuildOptions {
    runtimeVersion?: string;
    buildProfile?: string;
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
    buildProfile?: string;
}
interface EASUpdateOptions {
    type: AppProfile;
    updateBranchName?: string;
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
export declare const getExpoAppConfig: ({ gitReference, profile, platform, }: GetExpoAppConfigOptions) => Promise<ExpoConfig>;
/**
 * Get the finished builds for a given runtime version.
 * @param options - The options for the function.
 * @returns The list of finished builds.
 */
export declare const getBuilds: ({ runtimeVersion, buildProfile, }: GetBuildOptions) => Promise<FinishedBuild[]>;
/**
 * Update the EAS app with the latest commit message.
 * @param options - The options for the function.
 * @returns The trimmed output from the executed command.
 */
export declare const easUpdate: ({ type, updateBranchName, }: EASUpdateOptions) => Promise<string>;
/**
 * Build the EAS app for the specified platform and profile.
 * @param options - The options for the function.
 * @returns The iOS and Android build information.
 */
export declare const easBuild: ({ platform, profile }: EASBuildOptions) => Promise<{
    ios: FinishedBuild | undefined;
    android: FinishedBuild | undefined;
}>;
/**
 * Get compatible builds for the specified app profiles.
 * @param profiles - The app profiles to check compatibility for.
 * @returns The compatible builds, their count, profile, and app configuration.
 * @throws Throws an error if runtimeVersion in the Expo configuration is not a string.
 */
export declare const getCompatibleBuilds: (profiles: AppProfile[]) => Promise<{
    builds: FinishedBuild[];
    profile: AppProfile;
    count: number;
    appConfig: ExpoConfig;
} | {
    builds: never[];
    count: number;
    profile: null;
    appConfig?: undefined;
}>;
export {};
//# sourceMappingURL=expo.d.ts.map