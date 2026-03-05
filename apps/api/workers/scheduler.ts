import cron from "node-cron";
import { runGEWorker } from "./geWorker.js";
import { runMerchantWorker } from "./merchantWorker.js";
import { runVoSWorker } from "./vosWorker.js";

export function startSchedulers(): void {
  cron.schedule("*/30 * * * *", () => {
    void runGEWorker();
  });

  cron.schedule("0 * * * *", () => {
    void runMerchantWorker();
  });

  cron.schedule("*/5 * * * *", () => {
    void runVoSWorker();
  });
}
