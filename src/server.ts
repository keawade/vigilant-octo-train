import { randomUUID } from "node:crypto";

import { default as Fastify } from "fastify";

import { logger } from "./tooling/logger.ts";
import { db } from "./db.ts";
import { receiptSchema } from "./receiptSchema.ts";
import { processReceipt } from "./processReceipt.ts";

export const createServer = () => {
  const server = Fastify({ loggerInstance: logger });

  server.post("/receipts/process", async (request, reply) => {
    request.log.info({ body: request.body }, "howdy");
    const parseResponse = receiptSchema.safeParse(request.body);

    if (!parseResponse.success) {
      return reply.code(400).send(parseResponse.error.flatten());
    }

    const receipt = parseResponse.data;
    const id = randomUUID();

    db.set(id, { receipt });

    const points = processReceipt(receipt);

    reply.send({ id });

    db.set(id, { receipt, points: await points });
  });

  server.get("/receipts/:id/points", (request, reply) => {
    const { id } = request.params;

    const data = db.get(id);

    if (data === undefined) {
      return reply.code(404).send({ message: "Not found." });
    }

    if (data.points === undefined) {
      return reply.code(404).send({ message: "Not ready yet." });
    }

    return reply.send({ points: data.points });
  });

  return server;
};
