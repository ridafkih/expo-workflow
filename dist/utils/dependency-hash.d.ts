interface GetDependencyHashOptions {
    gitReference?: string;
}
interface CheckReferenceDependenciesOptions {
    gitReferences: string[];
}
export declare const getDependencyHash: ({ gitReference, }: GetDependencyHashOptions) => Promise<string>;
export declare const checkReferencesDependencies: ({ gitReferences: [anchorReference, ...gitReferences], }: CheckReferenceDependenciesOptions) => Promise<boolean>;
export {};
//# sourceMappingURL=dependency-hash.d.ts.map