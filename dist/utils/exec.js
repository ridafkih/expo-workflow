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
exports.getCwdExecOutput = void 0;
const exec_1 = require("@actions/exec");
const cwd = process.cwd();
/**
 * Get the output from executing a command in the current working directory.
 * @param command The command to be executed.
 * @param commandArguments The arguments for the command.
 * @param options The options for the exec function.
 * @returns The trimmed output from the executed command.
 */
const getCwdExecOutput = (command, commandArguments = [], options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(command, commandArguments, options);
    const { exitCode, stdout, stderr } = yield (0, exec_1.getExecOutput)(command, commandArguments, Object.assign(Object.assign({}, options), { cwd, ignoreReturnCode: true }));
    if (exitCode !== 0) {
        throw Error(`Command exited with code ${exitCode}: ${stderr}`);
    }
    return stdout.trim();
});
exports.getCwdExecOutput = getCwdExecOutput;
