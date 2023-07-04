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
const core_1 = require("@actions/core");
const expo_1 = require("../../utils/expo");
const sticky_message_1 = require("../../utils/sticky-message");
const buildTable = ({ status, branchName, version, runtimeVersion, iosBuildId, androidBuildId, }) => {
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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const branchName = (0, core_1.getInput)("branch-name");
    const comment = yield (0, sticky_message_1.getMessage)("build", `**When a build artifact compatible with this pull request is found, the information to download it will be placed here. If a compatible build cannot be found, it will be created. In the meantime, you can check builds [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds)**

    Hang tight while a build is found, or generated.
    `);
    const { builds, count } = yield (0, expo_1.getCompatibleBuilds)([
        "development",
        "artifact",
    ]);
    if (count === 0) {
        const { version, runtimeVersion } = yield (0, expo_1.getExpoAppConfig)({
            profile: "artifact",
            platform: "ios",
        });
        if (!version)
            throw Error("Something has gone wrong, and the `version` in the Expo configuration cannot be found.");
        if (!runtimeVersion || typeof runtimeVersion !== "string")
            throw Error("Something has gone wrong, and the `runtimeVersion` in the Expo configuration cannot be found, or it is not a string.");
        yield comment.update(`
      **A native change has been detected, an artifact for this branch is being generated and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

      ${buildTable({
            status: "Building ⏳",
            branchName,
            version,
            runtimeVersion,
        })}
    `);
        const build = yield (0, expo_1.easBuild)({ platform: "all", profile: "artifact" });
        yield comment.update(`
      **A native change has been detected, an artifact for this branch has been generated and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

      ${buildTable({
            status: "Complete ✅",
            branchName,
            version,
            runtimeVersion,
            iosBuildId: (_a = build.ios) === null || _a === void 0 ? void 0 : _a.id,
            androidBuildId: (_b = build.android) === null || _b === void 0 ? void 0 : _b.id,
        })}
    `);
        return;
    }
    const [ios] = builds.filter((build) => build.platform === "IOS" && build.buildProfile === "artifact");
    const [android] = builds.filter((build) => build.platform === "ANDROID" && build.buildProfile === "artifact");
    yield comment.update(`
    **A compatible artifact for this branch has been found and can be viewed [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds/)**

    ${buildTable({
        status: "Found 🔍",
        branchName,
        version: ios.appVersion,
        runtimeVersion: ios.runtimeVersion,
        iosBuildId: ios === null || ios === void 0 ? void 0 : ios.id,
        androidBuildId: android === null || android === void 0 ? void 0 : android.id,
    })}
  `);
});
exports.main = main;
(0, exports.main)();
