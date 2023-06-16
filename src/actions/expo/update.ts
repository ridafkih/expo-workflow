import { ExpoConfig } from "@expo/config-types";
import { getInput } from "@actions/core";
import { getCompatibleBuilds, easUpdate } from "../../utils/expo";
import { getMessage } from "../../utils/sticky-message";

const createQRCodeTable = (
  branchName: string,
  appConfig: ExpoConfig,
  type: "development" | "artifact"
) => {
  const appScheme =
    type === "development"
      ? "maxrewards%2bdevelopment"
      : "maxrewards%2bartifact";

  return `
  <table>
    <tr align="center">
      <th>Update QR Code</th>
    </tr>
    <tr>
      <td align="center">
        <img src="https://qr.expo.dev/development-client?appScheme=${appScheme}&url=${appConfig?.updates?.url}?channel-name=${branchName}" width="150" height="150" />
      </td>
    </tr>
  </table>
`;
};

export const main = async () => {
  const branchName = getInput("branch-name");

  const comment = await getMessage(
    "update",
    `**An update containing your changes is being generated. Once the update is generated, this comment will be updated with a QR code to scan. In the meantime, you can check updates [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/updates)**`
  );

  const { appConfig, profile = "artifact" } = await getCompatibleBuilds([
    "development",
    "artifact",
  ]);

  const type = profile === "artifact" ? "artifact" : "development";
  await easUpdate({ type });

  await comment.update(`
    **The EAS update for this branch has been generated. Ensure you have the correct client installed and scan the QR code below to preview the update. You can inspect the update [on the Expo dashboard ↗︎](https://expo.dev/accounts/maxrewards/projects/maxrewards/branches/${branchName})**

    ${createQRCodeTable(branchName, <ExpoConfig>appConfig, type)}
  `);
};

main();
