interface VersionDetails {
    patches: string[];
    latest: string;
}
export declare const checkout: (reference: string, install?: boolean) => Promise<void>;
export declare const getVersionTags: () => Promise<Record<string, VersionDetails>>;
export declare const getLatestCommitMessage: () => Promise<string>;
export declare const getLastCommitVersionTag: () => Promise<string | undefined>;
export declare const configureGit: (username: string, organizationName: string, repositoryName: string) => Promise<[string, string, string]>;
export declare const forcePush: (branch: string) => Promise<void>;
export declare const fetchTags: () => Promise<string | undefined>;
export {};
//# sourceMappingURL=git.d.ts.map