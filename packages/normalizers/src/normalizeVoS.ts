export type NormalizedVoS = {
  districts: string[];
};

type RawVoSPayload = {
  districts?: unknown[];
};

export function normalizeVoS(raw: unknown): NormalizedVoS {
  const payload = (raw ?? {}) as RawVoSPayload;
  return {
    districts: (payload.districts ?? []).map((district) => String(district ?? ""))
  };
}
