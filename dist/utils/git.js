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
exports.fetchTags = exports.forcePush = exports.configureGit = exports.getLastCommitVersionTag = exports.getLatestCommitMessage = exports.getVersionTags = exports.checkout = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("./exec");
const semver_1 = require("./semver");
const checkout = (reference, install = true) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.getCwdExecOutput)("git", ["checkout", reference]).catch(() => undefined);
    if (install)
        yield (0, exec_1.getCwdExecOutput)("yarn");
});
exports.checkout = checkout;
const getVersionTags = () => __awaiter(void 0, void 0, void 0, function* () {
    const stdout = yield (0, exec_1.getCwdExecOutput)("git", ["tag", "-l", "v*"]);
    const tags = stdout.split("\n").filter(Boolean).sort(semver_1.semverSort);
    const versions = {};
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
});
exports.getVersionTags = getVersionTags;
const getLatestCommitMessage = () => {
    return (0, exec_1.getCwdExecOutput)("git", ["log", "-1", "--pretty=format:%s by %aN"]);
};
exports.getLatestCommitMessage = getLatestCommitMessage;
const getLastCommitVersionTag = () => {
    return (0, exec_1.getCwdExecOutput)("git", [
        "describe",
        "--exact-match",
        "--match",
        "v[0-9]*.[0-9]*.[0-9]*",
        "HEAD",
    ]).catch(() => undefined);
};
exports.getLastCommitVersionTag = getLastCommitVersionTag;
const configureGit = (username, organizationName, repositoryName) => {
    return Promise.all([
        (0, exec_1.getCwdExecOutput)("git", [
            "remote",
            "set-url",
            "origin",
            `https://${username}:${(0, core_1.getInput)("github-token")}@github.com/${organizationName}/${repositoryName}.git`,
        ]),
        (0, exec_1.getCwdExecOutput)("git", [
            "config",
            "--global",
            "user.email",
            '"github-actions[bot]@users.noreply.github.com"',
        ]),
        (0, exec_1.getCwdExecOutput)("git", [
            "config",
            "--global",
            "user.name",
            '"github-actions[bot]"',
        ]),
    ]);
};
exports.configureGit = configureGit;
const forcePush = (branch) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.getCwdExecOutput)("git", [
        "push",
        "origin",
        branch,
        "--force",
        "--follow-tags",
    ]);
});
exports.forcePush = forcePush;
const fetchTags = () => {
    return (0, exec_1.getCwdExecOutput)("git", ["fetch", "--all", "--tags"]).catch(() => undefined);
};
exports.fetchTags = fetchTags;
