import type { Receipt } from "./receiptSchema";

export interface SimpleDatabase<T> {
  get: (id: string) => Promise<T | undefined>;
  set: (id: string, value: T) => Promise<void>;
}
export class Database<T> implements SimpleDatabase<T> {
  store = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.store.get(id);
  }

  async set(id: string, value: T): Promise<void> {
    this.store.set(id, value);
  }
}

export type ReceiptRecord = { points?: number; receipt: Receipt };
