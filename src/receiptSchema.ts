import { set, isValid, parse } from "date-fns";
import { z } from "zod";

export const numberWithTwoDecimalsRegex = /^\d+\.\d{2}$/;

const referenceDate = set(new Date(), {
  year: 2024,
  month: 0,
  date: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
});

export const receiptSchema = z.object({
  retailer: z.string(),
  purchaseDate: z
    .string()
    .refine(
      (dateStr: string) => isValid(parse(dateStr, "yyyy-MM-dd", referenceDate)),
      { message: "Invalid date." },
    ),
  purchaseTime: z
    .string()
    .refine(
      (timeStr: string) => isValid(parse(timeStr, "HH:mm", referenceDate)),
      { message: "Invalid time." },
    ),
  total: z
    .string()
    .regex(numberWithTwoDecimalsRegex, { message: "Invalid total." }),
  items: z.array(
    z.object({
      shortDescription: z.string(),
      price: z
        .string()
        .regex(numberWithTwoDecimalsRegex, { message: "Invalid price." }),
    }),
  ),
});
export type Receipt = z.infer<typeof receiptSchema>;
