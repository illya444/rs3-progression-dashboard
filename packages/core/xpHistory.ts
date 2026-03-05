import { db } from "../connectors/db/postgres"

export async function getXpHistory(username: string) {

  const result = await db.query(
    `
    SELECT
      player_snapshots.created_at,
      player_snapshots.total_xp
    FROM player_snapshots
    JOIN players
    ON players.id = player_snapshots.player_id
    WHERE players.username = $1
    ORDER BY created_at
    `,
    [username]
  )

  return result.rows

}
