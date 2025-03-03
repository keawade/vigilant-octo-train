import { describe, it } from "node:test";
import { default as assert } from "node:assert";
import { createServer } from "../../src/server.ts";

describe("GET /hello", () => {
  it("should return a howdy message", async (testContext) => {
    const app = await createServer();

    testContext.after(async () => {
      app.close();
    });

    const actual = await app.inject({ method: "get", url: "/hello" });

    assert.deepEqual(actual.json(), { message: "Howdy, world!" });
  });
});
