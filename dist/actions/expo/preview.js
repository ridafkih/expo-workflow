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
exports.main = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const git_1 = require("../../utils/git");
const dependency_hash_1 = require("../../utils/dependency-hash");
const npm_1 = require("../../utils/npm");
const exec_1 = require("../../utils/exec");
const expo_1 = require("../../utils/expo");
const github_1 = require("@actions/github");
const handleNonMatchingVersions = (versionTags, version) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [major, minor] = version.split(".");
    const majorMinor = `${major}.${minor}`;
    const { patches = [] } = (_a = versionTags === null || versionTags === void 0 ? void 0 : versionTags[majorMinor]) !== null && _a !== void 0 ? _a : {};
    if (patches.length === 0) {
        Promise.allSettled([
            (0, expo_1.easUpdate)({ type: "development", updateBranchName: "main" }),
            (0, expo_1.easBuild)({ platform: "ios", profile: "development" }),
        ]);
        return;
    }
    const isMostRecentPatch = patches[patches.length - 1] === `v${version}`;
    if (!isMostRecentPatch) {
        throw Error("You can only apply a patch to the most recent patch in the patch set. Please ensure you are updating the latest patch.");
    }
    yield (0, exec_1.getCwdExecOutput)("git", ["stash"]);
    yield (0, git_1.configureGit)();
    const patchVersion = yield (0, npm_1.incrementVersion)("patch");
    yield (0, expo_1.easUpdate)({ type: "development", updateBranchName: "main" });
    yield (0, git_1.checkout)("main");
    yield (0, exec_1.getCwdExecOutput)("git", [
        "merge",
        patchVersion,
        "-X",
        "ours",
        "-m",
        `Merge tag ${patchVersion}`,
        "--allow-unrelated-histories",
    ]);
    yield (0, npm_1.incrementVersion)("patch");
    yield (0, expo_1.easUpdate)({ type: "development", updateBranchName: "main" });
    yield (0, git_1.forcePush)("main").catch(() => undefined);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, git_1.fetchTags)();
    const lastCommitVersionTag = yield (0, git_1.getLastCommitVersionTag)();
    if (lastCommitVersionTag)
        return;
    yield (0, exec_1.getCwdExecOutput)("git", ["pull", "--all"]);
    const versionTags = yield (0, git_1.getVersionTags)();
    const tags = Object.entries(versionTags);
    const [majorMinor, { latest }] = tags[tags.length - 1];
    yield (0, git_1.checkout)("main");
    yield (0, exec_1.getCwdExecOutput)("git", ["log"]);
    const firstNonMergeCommit = yield (0, exec_1.getCwdExecOutput)("git", [
        "log",
        "--no-merges",
        "-n",
        "1",
        "--pretty=format:%H",
    ]);
    yield (0, git_1.checkout)(firstNonMergeCommit);
    const { version } = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), "package.json"), "utf-8"));
    const isLatestVersionDifferent = latest.slice(1) !== version;
    const isVersionMajorMinorMatch = version.startsWith(majorMinor);
    const isVersionMismatch = isLatestVersionDifferent && isVersionMajorMinorMatch;
    if (isVersionMismatch) {
        throw Error("The current version does not match the latest version and has an unexpected major-minor combination.");
    }
    if (isLatestVersionDifferent) {
        return handleNonMatchingVersions(versionTags, version);
    }
    const isPatch = yield (0, dependency_hash_1.checkReferencesDependencies)({
        gitReferences: [latest, github_1.context.sha],
    });
    yield (0, exec_1.getCwdExecOutput)("git", ["stash"]);
    yield (0, git_1.checkout)("main", false);
    yield (0, git_1.configureGit)();
    yield (0, npm_1.incrementVersion)(isPatch ? "patch" : "minor");
    yield (0, git_1.forcePush)("main").catch(() => undefined);
    if (isPatch)
        return (0, expo_1.easUpdate)({ type: "development", updateBranchName: "main" });
    (0, expo_1.easBuild)({ platform: "ios", profile: "development" });
});
exports.main = main;
(0, exports.main)();
