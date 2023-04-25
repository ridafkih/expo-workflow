import { ExpoConfig } from "@expo/config-types";
import { getInput } from "@actions/core";
import { getCompatibleBuilds, easUpdate } from "../../utils/expo";
import { getMessage } from "../../utils/sticky-message";

const createQRCodeTable = (branchName: string, appConfig: ExpoConfig) => `
  <table>
    <tr align="center">
      <th>Update QR Code</th>
    </tr>
    <tr>
      <td align="center">
        <img src="https://qr.expo.dev/development-client?appScheme=maxrewards%2bartifact&url=${appConfig?.updates?.url}?channel-name=${branchName}" width="150" height="150" />
      </td>
    </tr>
  </table>
`;

export const main = async () => {
  const branchName = getInput("branch-name");

  const comment = await getMessage(
    "update",
    `**When a build artifact compatible with this pull request is found, the information to download it will be placed here. If a compatible build cannot be found, it will be created. In the meantime, you can check builds [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/builds)**

    Hang tight while a build is found, or generated.
    `
  );

  const { appConfig, profile = "artifact" } = await getCompatibleBuilds([
    "artifact",
    "development",
  ]);

  const type = profile === "artifact" ? "artifact" : "development";
  await easUpdate({ type });

  await comment.update(`
    **The EAS update for this branch has been generated. Ensure you have the correct client installed and scan the QR code below to preview the update. You can inspect the update [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/branches/${branchName})**

    ${createQRCodeTable(branchName, <ExpoConfig>appConfig)}
  `);
};

main();
