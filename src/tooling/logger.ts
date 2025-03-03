import type { FastifyBaseLogger } from "fastify";
import { pino, type LoggerOptions } from "pino";

const createLoggerOptions = (
  nodeEnvironment: string | undefined,
): LoggerOptions => {
  switch (nodeEnvironment) {
    case "development":
      return {
        enabled: true,
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      };

    case "test":
      return {
        enabled: false,
      };

    case "production":
    default:
      return {
        enabled: true,
        level: "info",
      };
  }
};

const pinoInstance = pino(createLoggerOptions(process.env.NODE_ENV));

export const logger: FastifyBaseLogger = pinoInstance;
