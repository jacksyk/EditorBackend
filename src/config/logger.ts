import winston from 'winston';
import { config } from './index';

// Define log formats
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: config.logger.level,
    defaultMeta: { service: 'enterprise-backend' },
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat
        }),
        // File transport for errors
        new winston.transports.File({
            filename: `logs/error-${config.logger.file}`,
            level: 'error',
            format: fileFormat
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: `logs/${config.logger.file}`,
            format: fileFormat
        })
    ]
});

// If we're not in production, log to the console as well
if (config.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

export default logger;
