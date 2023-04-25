import { getExecOutput } from "@actions/exec";

const cwd = process.cwd();

/**
 * Get the output from executing a command in the current working directory.
 * @param command The command to be executed.
 * @param commandArguments The arguments for the command.
 * @param options The options for the exec function.
 * @returns The trimmed output from the executed command.
 */
export const getCwdExecOutput = async (
  command: string,
  commandArguments: string[] = [],
  options: import("@actions/exec").ExecOptions = {}
): Promise<string> => {
  console.log(command, commandArguments, options);
  const { exitCode, stdout, stderr } = await getExecOutput(
    command,
    commandArguments,
    {
      ...options,
      cwd,
      ignoreReturnCode: true,
    }
  );

  if (exitCode !== 0) {
    throw Error(`Command exited with code ${exitCode}: ${stderr}`);
  }

  return stdout.trim();
};
