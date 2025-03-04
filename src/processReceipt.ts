import type { Receipt } from "./receiptSchema.ts";
import {
  bigNameRule,
  dateDayRule,
  everyTwoItemsRule,
  itemNameLengthRule,
  midAfternoonRule,
  noCoinsRule,
  quartersRule,
} from "./rules.ts";

export const processReceipt = async (receipt: Receipt): Promise<number> => {
  let points = 0;

  const processors: Array<(receipt: Receipt) => Promise<number>> = [
    bigNameRule,
    noCoinsRule,
    quartersRule,
    everyTwoItemsRule,
    itemNameLengthRule,
    dateDayRule,
    midAfternoonRule,
  ];

  for (const processor of processors) {
    points += await processor(receipt);
  }

  return points;
};
