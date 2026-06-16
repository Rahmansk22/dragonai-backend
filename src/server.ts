import 'dotenv/config';
import { createApp } from "./app";
import { config } from "./config/env";

async function start() {
  const app = await createApp();
  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    console.log(`🚀 AI backend running on http://localhost:${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
