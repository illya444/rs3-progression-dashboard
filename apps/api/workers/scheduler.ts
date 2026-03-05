import cron from "node-cron"
import { updateActivities } from "./activityWorker"

cron.schedule("0 * * * *", () => {
  updateActivities()
})
