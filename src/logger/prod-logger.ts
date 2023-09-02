import { format, createLogger, transports } from "winston";
const { combine, timestamp, errors, json, prettyPrint } = format;

function buildProdLogger() {
  console.log({ ErrorLogFile: `${__dirname}/prod-logs/error.log` });
  return createLogger({
    format: combine(timestamp(), errors({ stack: true }), prettyPrint()),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: `${__dirname}/prod-logs/error.log`,
        level: "error",
        format: json(),
      }),
      new transports.File({
        filename: `${__dirname}/prod-logs/debug.log`,
        level: "debug",
        format: combine(prettyPrint()),
      }),
      new transports.File({
        filename: `${__dirname}/prod-logs/combined.log`,
        format: combine(prettyPrint()),
      }),
    ],
  });
}

export default buildProdLogger();
