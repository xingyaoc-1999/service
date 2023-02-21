import express from "express";
import routes from "./routes";
import config from "config";

import logger from "./utils/logger";
const app = express();
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.use(express.json());
const PORT = config.get<number>("port");

app.listen(PORT, async () => {
  console.log(`Express with Typescript! http://localhost:${PORT}`);
  routes(app);
});
