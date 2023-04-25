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
export declare const getExpoAppConfig: ({ gitReference, profile, platform, }: GetExpoAppConfigOptions) => Promise<ExpoConfig>;
export declare const getBuilds: ({ runtimeVersion }: GetBuildOptions) => Promise<FinishedBuild[]>;
export declare const easUpdate: ({ type }: EASUpdateOptions) => Promise<string>;
export declare const easBuild: ({ platform, profile }: EASBuildOptions) => Promise<{
    ios: {
        platform: "IOS" | "ANDROID";
        id: string;
    };
    android: {
        platform: "IOS" | "ANDROID";
        id: string;
    };
}>;
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