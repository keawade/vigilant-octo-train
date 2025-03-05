import type { Receipt } from "./receiptSchema";
import { logger } from "./tooling/logger.ts";

export interface SimpleDatabase<T> {
  get: (id: string) => Promise<T | undefined>;
  set: (id: string, value: T) => Promise<void>;
}
export class Database<T> implements SimpleDatabase<T> {
  store = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    logger.trace({ id }, "Reading record from database.");
    return this.store.get(id);
  }

  async set(id: string, value: T): Promise<void> {
    logger.trace({ id }, "Writing record to database.");
    this.store.set(id, value);
  }
}

export type ReceiptRecord = { points?: number; receipt: Receipt };
