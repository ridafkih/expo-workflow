"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompatibleBuilds = exports.easBuild = exports.easUpdate = exports.getBuilds = exports.getExpoAppConfig = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("./exec");
const git_1 = require("./git");
/**
 * Get the Expo app config for a given git reference, profile, and platform.
 * @param options The options for the function.
 * @returns The Expo app config.
 */
const getExpoAppConfig = ({ gitReference, profile, platform, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (gitReference) {
        yield (0, git_1.checkout)(gitReference);
    }
    const stdout = yield (0, exec_1.getCwdExecOutput)("eas", [
        "config",
        `--profile=${profile}`,
        `--platform=${platform}`,
        "--non-interactive",
        "--json",
    ]);
    const { appConfig } = JSON.parse(stdout);
    return appConfig;
});
exports.getExpoAppConfig = getExpoAppConfig;
/**
 * Get the finished builds for a given runtime version.
 * @param options - The options for the function.
 * @returns The list of finished builds.
 */
const getBuilds = ({ runtimeVersion, buildProfile, }) => __awaiter(void 0, void 0, void 0, function* () {
    const options = ["--status=finished", "--non-interactive", "--json"];
    if (runtimeVersion) {
        options.push(`--runtimeVersion=${runtimeVersion}`);
    }
    if (buildProfile) {
        options.push(`--buildProfile=${buildProfile}`);
    }
    const stdout = yield (0, exec_1.getCwdExecOutput)("eas", ["build:list", ...options]);
    return JSON.parse(stdout);
});
exports.getBuilds = getBuilds;
/**
 * Update the EAS app with the latest commit message.
 * @param options - The options for the function.
 * @returns The trimmed output from the executed command.
 */
const easUpdate = ({ type, updateBranchName, }) => __awaiter(void 0, void 0, void 0, function* () {
    const branchName = (0, core_1.getInput)("branch-name");
    const commitMessageContents = yield (0, git_1.getLatestCommitMessage)();
    return (0, exec_1.getCwdExecOutput)("eas", [
        "update",
        `--message`,
        commitMessageContents,
        `--branch=${updateBranchName !== null && updateBranchName !== void 0 ? updateBranchName : branchName}`,
        "--non-interactive",
    ], { env: Object.assign({ APP_VARIANT: type }, process.env) });
});
exports.easUpdate = easUpdate;
/**
 * Build the EAS app for the specified platform and profile.
 * @param options - The options for the function.
 * @returns The iOS and Android build information.
 */
const easBuild = ({ platform, profile }) => __awaiter(void 0, void 0, void 0, function* () {
    const stdout = yield (0, exec_1.getCwdExecOutput)("eas", [
        "build",
        `--platform=${platform}`,
        `--profile=${profile}`,
        "--json",
        "--non-interactive",
    ], { env: Object.assign({ APP_VARIANT: profile }, process.env) });
    const builds = JSON.parse(stdout);
    const ios = builds.find(({ platform, buildProfile }) => platform === "IOS" && profile === buildProfile);
    const android = builds.find(({ platform, buildProfile }) => platform === "ANDROID" && profile === buildProfile);
    return { ios, android };
});
exports.easBuild = easBuild;
/**
 * Get compatible builds for the specified app profiles.
 * @param profiles - The app profiles to check compatibility for.
 * @returns The compatible builds, their count, profile, and app configuration.
 * @throws Throws an error if runtimeVersion in the Expo configuration is not a string.
 */
const getCompatibleBuilds = (profiles) => __awaiter(void 0, void 0, void 0, function* () {
    for (const profile of profiles) {
        const appConfig = yield (0, exports.getExpoAppConfig)({
            platform: "ios",
            profile,
        });
        if (typeof appConfig.runtimeVersion !== "string") {
            throw Error("runtimeVersion in the Expo configuration must be of type 'string'.");
        }
        const builds = yield (0, exports.getBuilds)({
            runtimeVersion: appConfig.runtimeVersion,
            buildProfile: profile,
        });
        if (builds.length > 0) {
            return { builds, profile, count: builds.length, appConfig };
        }
    }
    return { builds: [], count: 0, profile: null };
});
exports.getCompatibleBuilds = getCompatibleBuilds;
