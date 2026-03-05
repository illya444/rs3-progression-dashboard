import { fetchVoS } from "@rs3/connectors";
import { normalizeVoS } from "@rs3/normalizers";
import { cache } from "../src/services/cache.js";
import { config } from "../src/config/config.js";

export async function runVoSWorker(): Promise<void> {
  const raw = await fetchVoS(config.upstream.vos);
  const normalized = normalizeVoS(raw);
  await cache.set("vos_rotation", normalized, config.cacheTtlSeconds);
}
