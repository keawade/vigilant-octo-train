import { describe, it } from "node:test";

import {
  bigNameRule,
  dateDayRule,
  everyTwoItemsRule,
  itemNameLengthRule,
  midAfternoonRule,
  noCoinsRule,
  processReceipt,
  quartersRule,
} from "../../src/rules.ts";
import assert from "node:assert";
import type { Receipt } from "../../src/receiptSchema.ts";

const fixture: Receipt = {
  retailer: "",
  items: [],
  purchaseDate: "",
  purchaseTime: "",
  total: "",
};

describe("Receipt processing rules", () => {
  describe("Big name rule", () => {
    const testCases = [
      { points: 3, name: "Bob" },
      { points: 12, name: "Bob's Emporium" },
      { points: 6, name: "Qbert's *&(@&#$@(&^@#$" },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for the retailer name '${testCase.name}'.`, () => {
        assert.equal(
          bigNameRule({ ...fixture, retailer: testCase.name }),
          testCase.points,
        );
      });
    }
  });

  describe("No coins rule", () => {
    const testCases = [
      { points: 50, total: "0.00" },
      { points: 50, total: "9999999.00" },
      { points: 50, total: "-5.00" },
      { points: 0, total: "0.01" },
      { points: 0, total: "999999999.99" },
      { points: 0, total: "-5.01" },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for ${testCase.total} total dollar amount.`, () => {
        assert.equal(
          noCoinsRule({ ...fixture, total: testCase.total }),
          testCase.points,
        );
      });
    }
  });

  describe("Quarters rule", () => {
    const testCases = [
      { points: 25, total: "0.00" },
      { points: 25, total: "9999999.00" },
      { points: 25, total: "-5.00" },
      { points: 25, total: "0.25" },
      { points: 25, total: "9999999.25" },
      { points: 25, total: "-5.25" },
      { points: 25, total: "0.50" },
      { points: 25, total: "9999999.50" },
      { points: 25, total: "-5.50" },
      { points: 25, total: "0.75" },
      { points: 25, total: "9999999.75" },
      { points: 25, total: "-5.75" },
      { points: 0, total: "0.01" },
      { points: 0, total: "999999999.99" },
      { points: 0, total: "-5.01" },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for ${testCase.total} total dollar amount.`, () => {
        assert.equal(
          quartersRule({ ...fixture, total: testCase.total }),
          testCase.points,
        );
      });
    }
  });

  describe("Every two items rule", () => {
    const fillerItem: Receipt["items"][0] = {
      price: "1.00",
      shortDescription: "Thing",
    };
    const testCases = [
      { points: 0, items: new Array(0).fill(fillerItem) },
      { points: 0, items: new Array(1).fill(fillerItem) },
      { points: 5, items: new Array(2).fill(fillerItem) },
      { points: 5, items: new Array(3).fill(fillerItem) },
      { points: 10, items: new Array(4).fill(fillerItem) },
      { points: 10, items: new Array(5).fill(fillerItem) },
      { points: 125, items: new Array(50).fill(fillerItem) },
      { points: 1255, items: new Array(502).fill(fillerItem) },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for a receipt with ${testCase.items.length} items.`, () => {
        assert.equal(
          everyTwoItemsRule({ ...fixture, items: testCase.items }),
          testCase.points,
        );
      });
    }
  });

  describe("Item name length rule", () => {
    const testCases = [
      { points: 0, items: [] },
      { points: 0, items: [{ price: "1.00", shortDescription: "Thing" }] },
      { points: 0, items: [{ price: "1.00", shortDescription: "Fo" }] },
      { points: 1, items: [{ price: "1.00", shortDescription: "Foo" }] },
      { points: 0, items: [{ price: "1.00", shortDescription: "Fooo" }] },
      { points: 1, items: [{ price: "1.00", shortDescription: "FooBar" }] },
      { points: 1, items: [{ price: "1.00", shortDescription: " Foo" }] },
      { points: 1, items: [{ price: "1.00", shortDescription: "Foo " }] },
      { points: 1, items: [{ price: "1.00", shortDescription: " Foo " }] },
      { points: 1, items: [{ price: "2.00", shortDescription: "Foo" }] },
      { points: 1, items: [{ price: "3.00", shortDescription: "Foo" }] },
      { points: 1, items: [{ price: "4.00", shortDescription: "Foo" }] },
      { points: 1, items: [{ price: "5.00", shortDescription: "Foo" }] },
      { points: 2, items: [{ price: "6.00", shortDescription: "Foo" }] },
      { points: 20, items: [{ price: "99.00", shortDescription: "Foo" }] },
      {
        points: 2,
        items: [
          { price: "1.00", shortDescription: "Foo" },
          { price: "1.00", shortDescription: "Bar" },
        ],
      },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for item names of '${testCase.items.map((item) => item.shortDescription).join("', '")}'.`, () => {
        assert.equal(
          itemNameLengthRule({ ...fixture, items: testCase.items }),
          testCase.points,
        );
      });
    }
  });

  describe("Date day rule", () => {
    const testCases = [
      { points: 6, date: "2000-01-01" },
      { points: 0, date: "2000-01-02" },
      { points: 6, date: "2000-01-03" },
      { points: 6, date: "2000-06-01" },
      { points: 6, date: "2025-01-01" },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for purchase date of '${testCase.date}'.`, () => {
        assert.equal(
          dateDayRule({ ...fixture, purchaseDate: testCase.date }),
          testCase.points,
        );
      });
    }
  });

  describe("Mid afternoon rule", () => {
    const testCases = [
      { points: 0, time: "00:00" },
      { points: 0, time: "02:00" },
      { points: 0, time: "13:59" },
      { points: 10, time: "14:00" },
      { points: 10, time: "14:01" },
      { points: 10, time: "15:59" },
      { points: 0, time: "16:00" },
      { points: 0, time: "16:01" },
      { points: 0, time: "22:00" },
    ];

    for (const testCase of testCases) {
      it(`should reward ${testCase.points} points for purchase time of '${testCase.time}'.`, () => {
        assert.equal(
          midAfternoonRule({ ...fixture, purchaseTime: testCase.time }),
          testCase.points,
        );
      });
    }
  });
});

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
    it(`should reward ${testCase.points} points for '${testCase.receipt.retailer}' fixture.`, () => {
      assert.equal(processReceipt(testCase.receipt), testCase.points);
    });
  }
});
