import { describe, it } from "node:test";
import { default as assert } from "node:assert";
import { createServer } from "../src/server.ts";

describe("createServer", () => {
  it("should return a Fastify instance", async () => {
    const actual = createServer();

    assert(actual);
  });
});
