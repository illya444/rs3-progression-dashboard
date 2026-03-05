import cron from "node-cron"
import { snapshotPlayer } from "./snapshotWorker"

const USERNAME = "ILLYA444"

cron.schedule("0 */6 * * *", () => {

  console.log("Running player snapshot")

  snapshotPlayer(USERNAME)

})
