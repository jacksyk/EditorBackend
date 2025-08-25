import express from 'express';
import 'reflect-metadata';
import dotenv from 'dotenv';
import Database from '../config/database';
import logger from '../config/logger';
import { UserRouter, ArticleRouter } from '../router';

// 加载环境变量
dotenv.config();

// Create a new express application instance
const app: express.Application = express();

app.use(express.json({ limit: '10mb' })); // 解析JSON请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // 解析URL编码请求体

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
app.use('/user', UserRouter);
app.use('/article', ArticleRouter);

app.listen(PORT, async () => {
    try {
        await Database.syncModels();
        logger.info(`服务器启动成功，监听端口: http://localhost:${PORT}/`);
    } catch (error) {
        logger.error('服务器启动失败:', error);
        process.exit(1);
    }
});
