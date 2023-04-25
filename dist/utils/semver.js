"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semverSort = void 0;
const semverSort = (comparitor, current) => {
    const [comparisonMajor, comparisonMinor, comparisonPatch] = comparitor
        .slice(1)
        .split(".")
        .map(Number);
    const [major, minor, patch] = current.slice(1).split(".").map(Number);
    if (comparisonMajor !== major)
        return comparisonMajor - major;
    if (comparisonMinor !== minor)
        return comparisonMinor - minor;
    return comparisonPatch - patch;
};
exports.semverSort = semverSort;
