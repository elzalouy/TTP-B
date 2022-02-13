import { format, createLogger, transports } from 'winston';
const { combine, timestamp, printf, errors, json, prettyPrint } = format;

function buildDevLogger() {
  const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  });

  return createLogger({
    level: 'debug',
    format: combine(
      // format.colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat,
      prettyPrint()
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: 'src/logger/dev-logs/error.log',
        level: 'error',
        format: combine(
          prettyPrint()
        ),
      }),
      new transports.File({
        filename: 'src/logger/dev-logs/combined.log',
        format: combine(
          prettyPrint()
        ),
      }),
    ],
  });
}


export default buildDevLogger()