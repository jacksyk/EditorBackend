import { Router } from 'express';
import { UserController } from '../controller/User';
import { body, param, query } from 'express-validator';

const router = Router();

// 用户注册验证规则
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .isEmail()
    .withMessage('请提供有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('密码长度必须在6-50个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色只能是admin或user')
];

// 用户更新验证规则
const updateUserValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请提供有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6, max: 50 })
    .withMessage('密码长度必须在6-50个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色只能是admin或user')
];

// 登录验证规则
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('请提供有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// ID参数验证规则
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数')
];

// 批量删除验证规则
const batchDeleteValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('请提供有效的用户ID数组'),
  body('ids.*')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数')
];

// 角色更新验证规则
const roleUpdateValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数'),
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('角色只能是admin或user')
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
  query('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色只能是admin或user'),
  query('sortBy')
    .optional()
    .isIn(['id', 'username', 'email', 'createdAt'])
    .withMessage('排序字段无效'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('排序方向只能是ASC或DESC')
];

// ==================== 路由定义 ====================

// 用户CRUD操作
router.post('/', createUserValidation, UserController.createUser);                    // 创建用户
router.get('/', queryValidation, UserController.getUsers);                           // 获取用户列表
router.get('/stats', UserController.getUserStats);                                   // 获取用户统计信息
router.get('/:id', idValidation, UserController.getUserById);                        // 根据ID获取用户
router.put('/:id', updateUserValidation, UserController.updateUser);                // 更新用户信息
router.delete('/:id', idValidation, UserController.deleteUser);                      // 软删除用户

// 特殊操作
router.post('/login', loginValidation, UserController.login);                        // 用户登录
router.post('/batch-delete', batchDeleteValidation, UserController.batchDeleteUsers); // 批量删除用户
router.patch('/:id/role', roleUpdateValidation, UserController.updateUserRole);      // 更新用户角色
router.patch('/:id/restore', idValidation, UserController.restoreUser);             // 恢复已删除用户
router.delete('/:id/force', idValidation, UserController.forceDeleteUser);          // 永久删除用户

// 查询操作
router.get('/email/:email', UserController.getUserByEmail);                         // 根据邮箱获取用户
router.get('/username/:username', UserController.getUserByUsername);                // 根据用户名获取用户

export default router;