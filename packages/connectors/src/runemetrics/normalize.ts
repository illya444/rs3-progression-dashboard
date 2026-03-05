// Deprecated compatibility shim. Normalization now lives in @rs3/normalizers.
export function normalizeProfile<T>(raw: T): T {
  return raw;
}

export function normalizeQuests<T>(raw: T): T {
  return raw;
}
