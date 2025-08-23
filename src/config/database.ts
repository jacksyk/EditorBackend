import { Sequelize } from 'sequelize-typescript';
import { config } from './index';
import logger from './logger';
import { User, Article } from '../model';

// Initialize Sequelize
const sequelize = new Sequelize({
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: config.database.logging ? (sql) => logger.debug(sql) : false,
    models: [User, Article], // 直接使用导入的模型
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00' // Set to your timezone
});

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
};

// Sync database models
const syncModels = async () => {
    try {
        await sequelize.sync({ alter: config.env === 'development' });
        logger.info('Database models synchronized successfully.');
    } catch (error) {
        logger.error('Error synchronizing database models:', error);
        throw error;
    }
};

export default {
    sequelize,
    testConnection,
    syncModels
};
