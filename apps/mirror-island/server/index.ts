import express from "express";
import type { NextFunction, Request, Response } from "express";
import { createForumSsoBridge } from "../src/sso/provider.ts";

const port = resolvePort(process.env.PORT);
const forumSsoBridge = await createForumSsoBridge();
const app = express();

app.use((request, response, next) => {
  void forwardForumSso(request, response, next);
});
app.get("/health", (_request, response) => {
  response.type("text/plain").status(200).send("ok");
});
app.use((_request, response) => {
  response.type("text/plain").status(404).send("not found");
});
app.use((_error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  response.type("text/plain").status(500).send("internal error");
});
app.listen(port, "0.0.0.0", () => {
  console.log(`Mirror Island identity runtime listening on ${port}.`);
});

/** Parses the configured TCP port and rejects values outside the valid listener range. */
function resolvePort(rawPort: string | undefined): number {
  const value = Number.parseInt(rawPort || "3001", 10);
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return value;
}

/** Gives the existing forum OIDC bridge first refusal, then continues into narrow HTTP routes. */
async function forwardForumSso(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!(await forumSsoBridge.handle(request, response))) next();
  } catch {
    next(new Error("Forum SSO bridge request failed."));
  }
}
