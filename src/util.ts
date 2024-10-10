import pino from "pino";

export const getLogger = (logpath?: string) => {
  const defaultLevel = process.env.log_level || "info";

  return pino({
    level: defaultLevel,
    base: {
      pid: process.pid,
    },
    transport: {
      target: "pino/file",
      options: {
        destination: logpath || "airdrop.log",
        colorize: false,
      },
    },
  });
};
