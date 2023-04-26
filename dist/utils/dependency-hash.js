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
exports.checkReferencesDependencies = exports.getDependencyHash = void 0;
const exec_1 = require("./exec");
const git_1 = require("./git");
/**
 * Get the dependency hash for a given git reference.
 * @param options - The options for the function.
 * @returns The dependency hash.
 */
const getDependencyHash = ({ gitReference, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (gitReference) {
        yield (0, git_1.checkout)(gitReference);
    }
    const hash = yield (0, exec_1.getCwdExecOutput)("npx", ["dephash", "hash", "--raw"]);
    return hash;
});
exports.getDependencyHash = getDependencyHash;
/**
 * Check if the dependencies of git references match the anchor reference.
 * @param options - The options for the function.
 * @returns True if all git references have the same dependency hash as the anchor reference, false otherwise.
 */
const checkReferencesDependencies = ({ gitReferences: [anchorReference, ...gitReferences], }) => __awaiter(void 0, void 0, void 0, function* () {
    const anchorHash = yield (0, exports.getDependencyHash)({ gitReference: anchorReference });
    for (const gitReference of gitReferences) {
        const referenceHash = yield (0, exports.getDependencyHash)({ gitReference });
        if (referenceHash !== anchorHash) {
            return false;
        }
    }
    return true;
});
exports.checkReferencesDependencies = checkReferencesDependencies;
