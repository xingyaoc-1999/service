import pino from "pino";

const log = pino({
  transport: {
    target: "pino-pretty",
  },
  base: {
    pid: false,
  },
  timestamp() {
    return new Date().getTime().toString();
  },
});

export default log;
