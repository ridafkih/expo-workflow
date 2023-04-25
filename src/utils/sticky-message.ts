import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

const createBody = (content: string) => {
  return content
    .split("\n")
    .map((contents) => contents.trim())
    .join("\n")
    .trim();
};

export const getMessage = async (id: string, defaultContent: string) => {
  const token = getInput("github-token");
  const github = getOctokit(token);

  const { number, owner, repo } = context.issue;

  const comments = await github.rest.issues.listComments({
    issue_number: number,
    owner,
    repo,
  });

  const identifier = `<!-- exflo:${number}:${id} -->`;
  let [comment] = comments.data.filter(({ body }) =>
    body?.includes(identifier)
  );

  if (!comment) {
    comment = await github.rest.issues
      .createComment({
        body: createBody(`${identifier}\n${defaultContent.trim()}`),
        issue_number: number,
        owner,
        repo,
      })
      .then(({ data }) => data);
  } else {
    await github.rest.issues.updateComment({
      body: createBody(`${identifier}\n${defaultContent.trim()}`),
      comment_id: comment.id,
      owner,
      repo,
    });
  }

  return {
    update: (content: string) =>
      github.rest.issues.updateComment({
        body: createBody(`${identifier}\n${content.trim()}`),
        comment_id: comment.id,
        owner,
        repo,
      }),
  };
};
