import { randomUUID } from "node:crypto";

import { default as Fastify } from "fastify";
import { z } from "zod";

import { logger } from "./tooling/logger.ts";
import {
  Database,
  type ReceiptRecord,
  type SimpleDatabase,
} from "./database.ts";
import { receiptSchema } from "./receiptSchema.ts";
import { processReceipt } from "./rules.ts";

const databaseInstance = new Database<ReceiptRecord>();
export const createServer = (
  database: SimpleDatabase<ReceiptRecord> = databaseInstance,
) => {
  const server = Fastify({ loggerInstance: logger });

  server.post("/receipts/process", async (request, reply) => {
    const parseResponse = receiptSchema.safeParse(request.body);

    if (!parseResponse.success) {
      return reply.code(400).send(parseResponse.error.flatten());
    }

    const receipt = parseResponse.data;
    const id = randomUUID();

    await database.set(id, { receipt });

    reply.send({ id });

    await database.set(id, { receipt, points: await processReceipt(receipt) });
  });

  const receiptsPointsParamsValidator = z.object({ id: z.string().uuid() });
  server.get("/receipts/:id/points", async (request, reply) => {
    const parseResponse = receiptsPointsParamsValidator.safeParse(
      request.params,
    );
    if (!parseResponse.success) {
      return reply.code(404).send({ message: "Not found." });
    }

    const data = await database.get(parseResponse.data.id);

    if (data === undefined) {
      return reply.code(404).send({ message: "Not found." });
    }

    if (data.points === undefined) {
      return reply.code(400).send({ message: "Not ready." });
    }

    return reply.send({ points: data.points });
  });

  return server;
};
