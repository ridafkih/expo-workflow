import { getCwdExecOutput } from "./exec";
import { checkout } from "./git";

interface GetDependencyHashOptions {
  gitReference?: string;
}

interface CheckReferenceDependenciesOptions {
  gitReferences: string[];
}

/**
 * Get the dependency hash for a given git reference.
 * @param options - The options for the function.
 * @returns The dependency hash.
 */
export const getDependencyHash = async ({
  gitReference,
}: GetDependencyHashOptions): Promise<string> => {
  if (gitReference) {
    await checkout(gitReference);
  }

  const hash = await getCwdExecOutput("npx", ["dephash", "hash", "--raw"]);

  return hash;
};

/**
 * Check if the dependencies of git references match the anchor reference.
 * @param options - The options for the function.
 * @returns True if all git references have the same dependency hash as the anchor reference, false otherwise.
 */
export const checkReferencesDependencies = async ({
  gitReferences: [anchorReference, ...gitReferences],
}: CheckReferenceDependenciesOptions): Promise<boolean> => {
  const anchorHash = await getDependencyHash({ gitReference: anchorReference });

  for (const gitReference of gitReferences) {
    const referenceHash = await getDependencyHash({ gitReference });
    if (referenceHash !== anchorHash) {
      return false;
    }
  }

  return true;
};
