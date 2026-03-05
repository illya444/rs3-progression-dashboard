import app from "./src/server.js";
import { config } from "./src/config/config.js";
import { startSchedulers } from "./workers/scheduler.js";

startSchedulers();

app.listen(config.port, () => {
  console.log(`API server listening on port ${config.port}`);
});
