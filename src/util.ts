import pino from "pino";

export const getLogger = () => {
  const defaultLevel = process.env.log_level || "info";

  return pino({
    level: defaultLevel,
    base: {
      pid: process.pid,
    },
    transport: {
      target: "pino-pretty",
    },
  });
};
