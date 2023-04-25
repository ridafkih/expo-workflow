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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const branchName = (0, core_1.getInput)("branch-name");
    const comment = yield (0, sticky_message_1.getMessage)("update", `**When a build artifact compatible with this pull request is found, the information to download it will be placed here. If a compatible build cannot be found, it will be created. In the meantime, you can check builds [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds)**

    Hang tight while a build is found, or generated.
    `);
    const { appConfig, profile = "artifact" } = yield (0, expo_1.getCompatibleBuilds)([
        "artifact",
        "development",
    ]);
    yield (0, expo_1.easUpdate)({
        type: profile === "artifact" ? "artifact" : "development",
    });
    yield comment.update(`
    **The EAS update for this branch has been generated. Ensure you have the correct client installed and scan the QR code below to preview the update. You can inspect the update [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/branches/${branchName})**

    <table>
      <tr align="center">
        <th>Update QR Code</th>
      </tr>
      <tr>
        <td align="center">
          <img src="https://qr.expo.dev/development-client?appScheme=maxrewards%2bartifact&url=${(_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.updates) === null || _a === void 0 ? void 0 : _a.url}?channel-name=${branchName}" width="150" height="150" />
        </td>
      </tr>
    </table>
  `);
});
exports.main = main;
(0, exports.main)();
