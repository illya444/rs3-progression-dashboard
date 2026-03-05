export type NormalizedMerchantItem = {
  id: number;
  name: string;
  quantity: number;
};

type RawMerchantItem = {
  id?: unknown;
  name?: unknown;
  quantity?: unknown;
};

type RawMerchantPayload = {
  items?: RawMerchantItem[];
};

export function normalizeMerchant(raw: unknown): { items: NormalizedMerchantItem[] } {
  const payload = (raw ?? {}) as RawMerchantPayload;
  return {
    items: (payload.items ?? []).map((item) => ({
      id: Number(item.id ?? 0),
      name: String(item.name ?? ""),
      quantity: Number(item.quantity ?? 0)
    }))
  };
}
