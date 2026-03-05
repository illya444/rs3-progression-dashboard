import { fetchProfile } from "@rs3/connectors";
import { normalizeProfile } from "@rs3/normalizers";

export async function snapshotPlayer(username: string) {
  const raw = await fetchProfile(username);
  return normalizeProfile(raw as Record<string, unknown>);
}
