import { describe, it } from "node:test";
import { default as assert } from "node:assert";

import { createServer } from "../../src/server.ts";
import type { ReceiptRecord, SimpleDatabase } from "../../src/database.ts";
import { wait } from "./wait.ts";

const fixtures = [
  {
    points: 28,
    receipt: {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        {
          shortDescription: "Mountain Dew 12PK",
          price: "6.49",
        },
        {
          shortDescription: "Emils Cheese Pizza",
          price: "12.25",
        },
        {
          shortDescription: "Knorr Creamy Chicken",
          price: "1.26",
        },
        {
          shortDescription: "Doritos Nacho Cheese",
          price: "3.35",
        },
        {
          shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ",
          price: "12.00",
        },
      ],
      total: "35.35",
    },
  },
  {
    points: 109,
    receipt: {
      retailer: "M&M Corner Market",
      purchaseDate: "2022-03-20",
      purchaseTime: "14:33",
      items: [
        {
          shortDescription: "Gatorade",
          price: "2.25",
        },
        {
          shortDescription: "Gatorade",
          price: "2.25",
        },
        {
          shortDescription: "Gatorade",
          price: "2.25",
        },
        {
          shortDescription: "Gatorade",
          price: "2.25",
        },
      ],
      total: "9.00",
    },
  },
];

describe("Complete receipt processing", () => {
  for (const fixture of fixtures) {
    it(`should reward ${fixture.points} points for '${fixture.receipt.retailer}' fixture.`, async () => {
      const server = createServer();

      const receiptProcessResponse = await server.inject({
        method: "POST",
        path: "/receipts/process",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fixture.receipt),
      });

      const { id } = receiptProcessResponse.json();

      const receiptPointsResponse = await server.inject({
        method: "GET",
        path: `/receipts/${id}/points`,
      });
      const { points } = receiptPointsResponse.json();

      assert.equal(points, fixture.points);
    });
  }
});

describe("Complete receipt processing with simulated database latency", () => {
  class DatabaseWithLatency<T> implements SimpleDatabase<T> {
    store = new Map<string, T>();

    async get(id: string): Promise<T | undefined> {
      return this.store.get(id);
    }

    async set(id: string, value: T): Promise<void> {
      await wait(1000);
      this.store.set(id, value);
    }
  }
  const mockedDatabase = new DatabaseWithLatency<ReceiptRecord>();

  it("should allow for latency", async () => {
    const server = createServer(mockedDatabase);

    const receiptProcessResponse = await server.inject({
      method: "POST",
      path: "/receipts/process",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(fixtures[0].receipt),
    });

    const { id } = receiptProcessResponse.json();

    const initialReceiptPointsResponse = await server.inject({
      method: "GET",
      path: `/receipts/${id}/points`,
    });

    assert.equal(initialReceiptPointsResponse.statusCode, 400);
    assert.deepEqual(initialReceiptPointsResponse.json(), {
      message: "Not ready.",
    });

    await wait(1200);

    const receiptPointsResponse = await server.inject({
      method: "GET",
      path: `/receipts/${id}/points`,
    });

    assert.deepEqual(receiptPointsResponse.json(), {
      points: fixtures[0].points,
    });
  });
});
