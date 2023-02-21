import { Express, Request, response, Response, Router } from "express";
import fs from "fs";
import { pipeline } from "stream";
import path from "path";
import util from "util";
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
    const fileId = req.body.uid;
    const upload = uploads[fileId];
    if (!upload) {
      res.status(404).send("can not find that");
      return;
    }
    res.status(200).send(upload.bytesReceived);
  });

  app.post("/file", (req, res) => {
    const form = new multiParty.Form();
    form.parse(req, (err, fields, files) => {
      Object.keys(files).forEach(function (name) {
        console.log("got file named " + name);
      });
    });
    res.end();
  });
  app.post("/upload", (req, res) => {
    const fileId = req.body.uid;
    let startByte = Number(req.headers["x-start-byte"]);
    let filePath = path.join("/temp", fileId);

    let upload = uploads[fileId] ?? {};

    let fileStream: fs.WriteStream = null!;
    if (!startByte) {
      upload.bytesReceived = 0;
      fileStream = fs.createWriteStream(filePath, {
        flags: "w",
      });
      return;
    }
    if (upload.bytesReceived !== startByte) {
      res.writeHead(400, "wrong start byte").send(upload.bytesReceived);
      return;
    }
    fileStream = fs.createWriteStream(filePath, {
      flags: "a",
    });

    req.on("data", (data) => {
      upload.bytesReceived += data.length;
    });
    req.pipe(fileStream);

    fileStream.on("close", () => {
      if (upload.bytesReceived === Number(req.headers["x-file-size"])) {
        delete uploads[fileId];
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
