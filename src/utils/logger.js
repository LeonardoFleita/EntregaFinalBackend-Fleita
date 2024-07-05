const winston = require("winston");

const customLevelsOpts = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "yellow",
    warning: "magenta",
    info: "green",
    http: "blue",
    debug: "rainbow",
  },
};

const devLogger = winston.createLogger({
  levels: customLevelsOpts.levels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOpts.colors }),
        winston.format.simple()
      ),
    }),
  ],
});

const prodLogger = winston.createLogger({
  levels: customLevelsOpts.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOpts.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "error",
      filename: `${__dirname}/../logs/errors.log`,
      format: winston.format.simple(),
    }),
  ],
});

const logger = process.env.NODE_ENV === "production" ? prodLogger : devLogger;

/**
 * @type {import("express").RequestHandler}
 */
const useLogger = (req, res, next) => {
  req.logger = logger;
  next();
};

module.exports = { useLogger };
