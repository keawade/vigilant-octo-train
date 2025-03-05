import type { Receipt } from "./receiptSchema";

export interface SimpleDatabase<Record> {
  get: (id: string) => Promise<Record | undefined>;
  set: (id: string, value: Record) => Promise<void>;
}
export class Database<Record> implements SimpleDatabase<Record> {
  store = new Map<string, Record>();

  async get(id: string): Promise<Record | undefined> {
    return this.store.get(id);
  }

  async set(id: string, value: Record): Promise<void> {
    this.store.set(id, value);
  }
}

export type ReceiptRecord = { points?: number; receipt: Receipt };
