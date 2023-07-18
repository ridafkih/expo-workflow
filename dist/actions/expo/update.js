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
const createQRCodeTable = (branchName, appConfig, type) => {
    var _a, _b;
    const appScheme = type === "development"
        ? "maxrewards%2bdevelopment"
        : "maxrewards%2bartifact";
    return `
  <table>
    <tr align="center">
      <th>Update QR Code</th>
    </tr>
    <tr>
      <td align="center">
        <img src="https://qr.expo.dev/development-client?appScheme=${appScheme}&url=${(_a = (0, core_1.getInput)("update-url")) !== null && _a !== void 0 ? _a : (_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.updates) === null || _b === void 0 ? void 0 : _b.url}?channel-name=${branchName}" width="150" height="150" />
      </td>
    </tr>
  </table>
`;
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const branchName = (0, core_1.getInput)("branch-name");
    const comment = yield (0, sticky_message_1.getMessage)("update", `**An update containing your changes is being generated. Once the update is generated, this comment will be updated with a QR code to scan. In the meantime, you can check updates [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/updates)**`);
    const { appConfig, profile = "artifact" } = yield (0, expo_1.getCompatibleBuilds)([
        "development",
        "artifact",
    ]);
    const type = profile === "artifact" ? "artifact" : "development";
    yield Promise.allSettled([
        (0, expo_1.easUpdate)({ type: "development" }),
        (0, expo_1.easUpdate)({ type: "artifact" }),
    ]);
    yield comment.update(`
    **The EAS update for this branch has been generated. Ensure you have the correct client installed and scan the QR code below to preview the update. You can inspect the update [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/branches/${branchName})**

    ${createQRCodeTable(branchName, appConfig, type)}
  `);
});
exports.main = main;
(0, exports.main)();
