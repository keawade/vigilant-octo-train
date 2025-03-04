import assert from "node:assert";
import { describe, it } from "node:test";
import { z } from "zod";

describe("Receipt processor service", () => {
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
      const receiptsProcessRawResponse = await fetch(
        "http://localhost:3000/receipts/process",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testCase.receipt),
        },
      );

      assert.equal(receiptsProcessRawResponse.status, 200);
      const receiptsProcessActual = z
        .object({ id: z.string().uuid() })
        .strict()
        .parse(await receiptsProcessRawResponse.json());

      const receiptsPointsRawResponse = await fetch(
        `http://localhost:3000/receipts/${receiptsProcessActual.id}/points`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const receiptsPointsActual = z
        .object({ points: z.number() })
        .strict()
        .parse(await receiptsPointsRawResponse.json());
      assert.equal(receiptsPointsActual.points, testCase.points);
    });
  }
});
