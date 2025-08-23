import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || '/api/v1',

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        name: process.env.DB_NAME || 'enterprise_db',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        logging: process.env.DB_LOGGING === 'true'
    },

    logger: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'app.log'
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*'
    }
};

export default config;
