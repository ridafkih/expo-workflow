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
exports.getMessage = void 0;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const createBody = (content) => {
    return content
        .split("\n")
        .map((contents) => contents.trim())
        .join("\n")
        .trim();
};
const getMessage = (id, defaultContent) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, core_1.getInput)("github-token");
    const github = (0, github_1.getOctokit)(token);
    const { number, owner, repo } = github_1.context.issue;
    const comments = yield github.rest.issues.listComments({
        issue_number: number,
        owner,
        repo,
    });
    const identifier = `<!-- exflo:${number}:${id} -->`;
    let [comment] = comments.data.filter(({ body }) => body === null || body === void 0 ? void 0 : body.includes(identifier));
    if (!comment) {
        comment = yield github.rest.issues
            .createComment({
            body: createBody(`${identifier}\n${defaultContent.trim()}`),
            issue_number: number,
            owner,
            repo,
        })
            .then(({ data }) => data);
    }
    else {
        yield github.rest.issues.updateComment({
            body: createBody(`${identifier}\n${defaultContent.trim()}`),
            comment_id: comment.id,
            owner,
            repo,
        });
    }
    return {
        update: (content) => github.rest.issues.updateComment({
            body: createBody(`${identifier}\n${content.trim()}`),
            comment_id: comment.id,
            owner,
            repo,
        }),
    };
});
exports.getMessage = getMessage;
