import fetch from "node-fetch"
import { db } from "../../../../packages/connectors/db/postgres"

export async function snapshotPlayer(username: string) {

  const res = await fetch(
    `https://apps.runescape.com/runemetrics/profile/profile?user=${username}`
  )

  const data = await res.json()

  const playerResult = await db.query(
    `
    INSERT INTO players (username)
    VALUES ($1)
    ON CONFLICT (username)
    DO UPDATE SET username = $1
    RETURNING id
    `,
    [username]
  )

  const playerId = playerResult.rows[0].id

  const snapshotResult = await db.query(
    `
    INSERT INTO player_snapshots
    (player_id, total_level, total_xp)
    VALUES ($1,$2,$3)
    RETURNING id
    `,
    [playerId, data.totalskill, data.totalxp]
  )

  const snapshotId = snapshotResult.rows[0].id

  for (const skill of data.skillvalues) {

    await db.query(
      `
      INSERT INTO skill_snapshots
      (snapshot_id, skill, level, xp)
      VALUES ($1,$2,$3,$4)
      `,
      [snapshotId, skill.id, skill.level, skill.xp]
    )

  }

}
