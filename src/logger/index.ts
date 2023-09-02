import { format, createLogger, transports } from "winston";
import { config } from "dotenv";
import winston from "winston/lib/winston/config";

config();

function buildLogger() {
  console.log({ ErrorLogFile: `${__dirname}/error.log` });
  const logger = createLogger({
    format: format.json(),
    level: "info",
    transports: [
      new transports.File({
        filename: `${__dirname}/error.log`,
        level: "error",
        format: format.json(),
      }),
      new transports.File({
        filename: `${__dirname}/debug.log`,
        level: "info",
        format: format.json(),
      }),
      new transports.File({
        filename: `${__dirname}/warning.log`,
        level: "warn",
        format: format.json(),
      }),
    ],
  });
  if (process.env.NODE_ENV === "production")
    logger.add(new transports.Console());
  return logger;
}
const logger = buildLogger();
export default logger;
