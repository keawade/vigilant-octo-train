import type { Receipt } from "./receiptSchema";

export const db = new Map<string, { points?: number; receipt: Receipt }>();
