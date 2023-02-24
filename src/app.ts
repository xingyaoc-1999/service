import express from "express";
import routes from "./routes";
import config from "config";
import cors from "cors";

import logger from "./utils/logger";
const app = express();
app.use(cors());
app.use(express.json());
const PORT = config.get<number>("port");

app.listen(PORT, async () => {
  console.log(`Express with Typescript! http://localhost:${PORT}`);
  routes(app);
});
