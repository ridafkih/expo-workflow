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
const github_1 = require("@actions/github");
const dependency_hash_1 = require("../../utils/dependency-hash");
const git_1 = require("../../utils/git");
const git_2 = require("../../utils/git");
const npm_1 = require("../../utils/npm");
const exec_1 = require("../../utils/exec");
const core_1 = require("@actions/core");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, git_1.fetchTags)();
    const lastCommitVersionTag = yield (0, git_2.getLastCommitVersionTag)();
    if (lastCommitVersionTag)
        return;
    const versionTags = yield (0, git_2.getVersionTags)();
    const tags = Object.entries(versionTags);
    const [majorMinor, { latest }] = tags[tags.length - 1];
    const head = (0, core_1.getInput)("head");
    yield (0, git_1.checkout)(head);
    const { version } = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), "package.json"), "utf-8"));
    console.log({
        versionTags,
        tags,
        version,
        majorMinor,
        latest,
        ref: github_1.context.ref,
        head,
    });
    if (latest.slice(1) !== version && version.startsWith(majorMinor))
        throw Error("Something has gone tewibbly wrong! >.< uwu");
    if (latest.slice(1) !== version) {
        const [major, minor] = version.split(".");
        const { patches } = versionTags[`${major}.${minor}`];
        const isMostRecentPatch = patches[patches.length - 1] === `v${version}`;
        if (!isMostRecentPatch)
            throw Error("You cannot patch a patch if it is not the last patch in the patch set. Patch patch patch! 🎃");
        yield (0, exec_1.getCwdExecOutput)("git", ["stash"]);
        yield (0, git_1.configureGit)();
        const patchVersion = yield (0, npm_1.incrementVersion)("patch");
        yield (0, git_1.checkout)("main", false);
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
        yield (0, git_1.forcePush)("main").catch(() => undefined);
        return;
    }
    const isPatch = yield (0, dependency_hash_1.checkReferencesDependencies)({
        gitReferences: [latest, head],
    });
    yield (0, exec_1.getCwdExecOutput)("git", ["stash"]);
    yield (0, git_1.configureGit)();
    yield (0, npm_1.incrementVersion)(isPatch ? "patch" : "minor");
    yield (0, git_1.forcePush)("main").catch(() => undefined);
    if (isPatch) {
        console.log("Would do a patch.");
    }
    else {
        console.log("Would do a build.");
    }
});
exports.main = main;
(0, exports.main)();
