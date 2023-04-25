import { getCwdExecOutput } from "./exec";

type ChangeType = "major" | "minor" | "patch";

export const incrementVersion = async (type: ChangeType) => {
  return getCwdExecOutput("npm", ["version", type]);
};
