import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { createStream } from "rotating-file-stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const isDevelopment = process.env.NODE_ENV !== "production";
const isVercel = Boolean(process.env.VERCEL);
const shouldWriteFiles = !isVercel && process.env.LOG_TO_FILES !== "false";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, "../../logs");

if (shouldWriteFiles && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const baseOptions = {
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "password",
      "*.password",
    ],
    censor: "[REDACTED]",
  },
};

const createDailyFileStream = (filename) =>
  createStream(filename, {
    interval: "1d",
    path: logsDir,
    compress: "gzip",
    size: "10M",
  });

const buildStreams = (fileName) => {
  const streams = [];

  if (isDevelopment) {
    streams.push({
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }),
    });
  } else {
    streams.push({ stream: process.stdout });
  }

  if (shouldWriteFiles) {
    streams.push({ stream: createDailyFileStream(fileName) });
  }

  return pino.multistream(streams);
};

const logger = pino(baseOptions, buildStreams("app.log"));
const auditLogger = pino(baseOptions, buildStreams("audit.log")).child({
  channel: "audit",
});
const securityLogger = pino(baseOptions, buildStreams("security.log")).child({
  channel: "security",
});

const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const requestId =
      typeof existing === "string" && existing.trim() ? existing : randomUUID();
    res.setHeader("x-request-id", requestId);
    return requestId;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} -> ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} -> ${res.statusCode} (${err.message})`,
});

export { logger, auditLogger, securityLogger, requestLogger };
