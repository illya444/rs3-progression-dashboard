export type NormalizedGEPrice = {
  id: number;
  name: string;
  price: number;
};

type RawGEItem = {
  id?: unknown;
  name?: unknown;
  price?: unknown;
};

type RawGEPayload = {
  data?: RawGEItem[];
};

export function normalizeGEPrices(raw: unknown): NormalizedGEPrice[] {
  const payload = (raw ?? {}) as RawGEPayload;
  return (payload.data ?? []).map((item) => ({
    id: Number(item.id ?? 0),
    name: String(item.name ?? ""),
    price: Number(item.price ?? 0)
  }));
}
