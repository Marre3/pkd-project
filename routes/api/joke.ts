import { HandlerContext } from "$fresh/server.ts";

const JOKES = [
    "här finns det inga skämt"
];

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const randomIndex = Math.floor(Math.random() * JOKES.length);
  const body = JOKES[randomIndex];
  return new Response(body);
};
