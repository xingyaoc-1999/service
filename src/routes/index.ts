import { Express, Request, response, Response, Router } from "express";
import fs from "fs";
import { pipeline } from "stream";
import path from "path";
import multiParty from "multiparty";
interface RouterConfig {
  path: string;
  router: Router;
  meta?: unknown;
}

const routerConfig: Array<RouterConfig> = [];
const uploads: { bytesReceived: number }[] = [];

const routes = (app: Express) => {
  app.get("/", (req: Request, res: Response) => {
    const stream = fs.createReadStream(
      path.join(__dirname, "../../assets/WLOP Aeolian3 by Eliza Final.mp4")
    );

    pipeline(stream, res, (err) => {
      console.log(err);
    });
  });

  app.get("/status", (req, res) => {
    const fileId = req.headers["x-file-id"] as any;
    const upload = uploads[fileId];
    if (!upload) {
      res.send("0");
      return;
    }
    res.status(200).send(upload.bytesReceived);
  });

  app.post("/upload", (req, res) => {
    const fileId = req.headers["x-file-id"];

    let startByte = Number(req.headers["x-start-byte"]);

    let filePath = path.join(__dirname, `../../temp/${fileId}`);

    let upload = uploads[fileId as any] ?? {};

    let fileStream: fs.WriteStream = null!;
    if (!startByte) {
      upload.bytesReceived = 0;
      fileStream = fs.createWriteStream(filePath, {
        flags: "w",
      });
    }
    if (upload.bytesReceived !== startByte) {
      res.writeHead(400, "wrong start byte").send(upload.bytesReceived);
      return;
    }
    fileStream = fs.createWriteStream(filePath, {
      flags: "a",
    });

    req.on("data", (data) => {
      console.log(data);
      upload.bytesReceived += data.length;
    });
    req.pipe(fileStream);
    fileStream.on("close", () => {
      if (upload.bytesReceived === Number(req.headers["x-file-size"])) {
        // BUG
        delete uploads[fileId as any]; //类型“string[]”不能作为索引类型使用。ts(2538)

        res.send({ url: filePath });
        return;
      }
      res.send();
    });
    fileStream.on("error", function (err) {
      res.writeHead(500, "File error").send(err);
    });
  });

  routerConfig.forEach((config) => app.use(config.path, config.router));
};

export default routes;
