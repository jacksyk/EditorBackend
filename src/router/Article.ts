import { Router } from 'express';
import { ArticleController } from '../controller/ArticleController';
import { body, param, query } from 'express-validator';

const router = Router();

// 文章创建验证规则
const createArticleValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('文章标题长度必须在3-100个字符之间')
    .trim(),
  body('content')
    .isLength({ min: 1, max: 10000000 })
    .withMessage('文章内容长度必须在10-10000个字符之间')
    .trim(),
  body('userId')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数')
];

// 文章更新验证规则
const updateArticleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('文章ID必须是正整数'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('文章标题长度必须在3-100个字符之间')
    .trim(),
  body('content')
    .optional()
    .isLength({ min: 10, max: 10000 })
    .withMessage('文章内容长度必须在10-10000个字符之间')
    .trim()
];

// ID参数验证规则
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('文章ID必须是正整数')
];

// 用户ID参数验证规则
const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数')
];

// 批量删除验证规则
const batchDeleteValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('请提供有效的文章ID数组'),
  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('文章ID必须是正整数')
];

// 查询参数验证规则
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数'),
  query('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('标题搜索关键词长度必须在1-100个字符之间'),
  query('sortBy')
    .optional()
    .isIn(['id', 'title', 'createdAt', 'updatedAt'])
    .withMessage('排序字段无效'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('排序方向只能是ASC或DESC'),
  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('includeDeleted必须是布尔值')
];

// 搜索验证规则
const searchValidation = [
  query('keyword')
    .isLength({ min: 1, max: 100 })
    .withMessage('搜索关键词长度必须在1-100个字符之间')
    .trim(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数'),
  query('sortBy')
    .optional()
    .isIn(['id', 'title', 'createdAt', 'updatedAt'])
    .withMessage('排序字段无效'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('排序方向只能是ASC或DESC')
];

// ==================== 路由定义 ====================

// 文章CRUD操作
router.post('/', createArticleValidation, ArticleController.createArticle);                    // 创建文章
router.get('/', queryValidation, ArticleController.getArticles);                              // 获取文章列表
router.get('/stats', ArticleController.getArticleStats);                                      // 获取文章统计信息
router.get('/search', searchValidation, ArticleController.searchArticles);                    // 搜索文章
router.get('/:id', idValidation, ArticleController.getArticleById);                          // 根据ID获取文章
router.put('/:id', updateArticleValidation, ArticleController.updateArticle);                // 更新文章
router.delete('/:id', idValidation, ArticleController.deleteArticle);                        // 软删除文章

// 特殊操作
router.post('/batch-delete', batchDeleteValidation, ArticleController.batchDeleteArticles);   // 批量删除文章
router.patch('/:id/restore', idValidation, ArticleController.restoreArticle);               // 恢复已删除文章
router.delete('/:id/force', idValidation, ArticleController.forceDeleteArticle);            // 永久删除文章

// 用户相关操作
router.get('/user/:userId', userIdValidation, ArticleController.getArticlesByUserId);        // 根据用户ID获取文章列表

export default router;