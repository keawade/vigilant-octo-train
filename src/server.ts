import { randomUUID } from "node:crypto";

import { default as Fastify } from "fastify";

import { logger } from "./tooling/logger.ts";
import { db } from "./db.ts";
import { receiptSchema } from "./receiptSchema.ts";
import { processReceipt } from "./rules.ts";
import { z } from "zod";

export const createServer = () => {
  const server = Fastify({ loggerInstance: logger });

  server.post("/receipts/process", async (request, reply) => {
    const parseResponse = receiptSchema.safeParse(request.body);

    if (!parseResponse.success) {
      return reply.code(400).send(parseResponse.error.flatten());
    }

    const receipt = parseResponse.data;
    const id = randomUUID();

    await db.set(id, { receipt });

    reply.send({ id });

    await db.set(id, { receipt, points: await processReceipt(receipt) });
  });

  const receiptsPointsParamsValidator = z.object({ id: z.string().uuid() });
  server.get("/receipts/:id/points", async (request, reply) => {
    const parseResponse = receiptsPointsParamsValidator.safeParse(
      request.params,
    );
    if (!parseResponse.success) {
      return reply.code(404).send({ message: "Not found." });
    }

    const data = await db.get(parseResponse.data.id);

    if (data === undefined) {
      return reply.code(404).send({ message: "Not found." });
    }

    return reply.send({ points: data.points });
  });

  return server;
};
