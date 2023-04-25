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
export declare const getDependencyHash: ({ gitReference, }: GetDependencyHashOptions) => Promise<string>;
/**
 * Check if the dependencies of git references match the anchor reference.
 * @param options - The options for the function.
 * @returns True if all git references have the same dependency hash as the anchor reference, false otherwise.
 */
export declare const checkReferencesDependencies: ({ gitReferences: [anchorReference, ...gitReferences], }: CheckReferenceDependenciesOptions) => Promise<boolean>;
export {};
//# sourceMappingURL=dependency-hash.d.ts.map