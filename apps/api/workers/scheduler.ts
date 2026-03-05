import cron from "node-cron"
import { runIntelligenceSync } from "./intelligenceWorker"

export function startSchedulers(redis: any) {

  cron.schedule("*/30 * * * *", () => {
    runIntelligenceSync(redis)
  })

}
