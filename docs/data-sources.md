# External Data Sources

## RuneMetrics API

Provides player state.

Endpoints:

https://apps.runescape.com/runemetrics/profile/profile?user=USERNAME
https://apps.runescape.com/runemetrics/quests?user=USERNAME

Data includes:

- skill levels
- XP
- quests
- activity history

---

## RuneScape Wiki API

Provides game knowledge.

Examples:

https://runescape.wiki/api.php
https://runescape.wiki/w/Module:GEIDs/data.json?action=raw

Used for:

- quest requirements
- item metadata
- skill requirements

---

## WeirdGloop API

Provides live game state.

Examples:

https://api.weirdgloop.org/exchange/history/rs/latest?id=ITEM_ID
https://api.weirdgloop.org/runescape/vos
https://api.weirdgloop.org/runescape/tms/current

Used for:

- GE prices
- Voice of Seren
- Travelling Merchant
