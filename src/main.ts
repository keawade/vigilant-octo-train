import { env } from "./tooling/env.ts";
import { createServer } from "./server.ts";

const server = createServer();

server.get("/health", (req, reply) => {
  return reply.send({ healthy: true });
});

const closeGracefully = async (signal: NodeJS.Signals) => {
  server.log.info(`Received signal to terminate: ${signal}`);

  await server.close();

  process.kill(process.pid, signal);
};
process.once("SIGINT", closeGracefully);
process.once("SIGTERM", closeGracefully);

await server.listen({ host: "0.0.0.0", port: env.PORT });
