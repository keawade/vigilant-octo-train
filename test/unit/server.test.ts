import { describe, it } from "node:test";
import { default as assert } from "node:assert";

import { createServer } from "../../src/server.ts";

describe("Complete receipt processing", () => {
  const testCases = [
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

  for (const testCase of testCases) {
    it(`should reward ${testCase.points} points for '${testCase.receipt.retailer}' fixture.`, async () => {
      const server = createServer();

      const receiptProcessResponse = await server.inject({
        method: "POST",
        path: "/receipts/process",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(testCase.receipt),
      });

      const { id } = receiptProcessResponse.json();

      const receiptPointsResponse = await server.inject({
        method: "GET",
        path: `/receipts/${id}/points`,
      });
      const { points } = receiptPointsResponse.json();

      assert.equal(points, testCase.points);
    });
  }
});
