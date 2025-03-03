import { default as Fastify } from "fastify";
import { logger } from "./tooling/logger.ts";

export const createServer = () => {
  const server = Fastify({ loggerInstance: logger });

  server.get("/hello", (_request, reply) => {
    return reply.send({ message: "Howdy, world!" });
  });

  return server;
};
