# rs3-progression-dashboard
RS3 Progression Dashboard - data-driven progression engine integrating RuneMetrics, Weird Gloop APIs, and activity planning systems.

## Local Dev

### Install

```bash
pnpm install
```

### Run API

```bash
pnpm --filter api dev
```

### Sample requests

```bash
curl http://localhost:3000/health
curl http://localhost:3000/runemetrics/illya444
curl http://localhost:3000/quests/illya444
curl http://localhost:3000/next-targets/illya444
curl http://localhost:3000/targets/illya444
```

## Validation

```bash
pnpm -r typecheck
pnpm -r build
```

Sample `/targets/:username` response:

```json
{
  "username": "illya444",
  "fetchedAtIso": "2026-03-05T00:00:00.000Z",
  "recommendations": [
    {
      "title": "Unlock Prifddinas Access",
      "type": "infrastructure",
      "score": 962,
      "reasons": ["High-value city unlock"]
    }
  ],
  "blockedTopReasons": [
    "Plague's End: train herblore 72->75"
  ]
}
```
