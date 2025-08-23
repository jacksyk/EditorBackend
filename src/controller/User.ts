import { Request, Response } from 'express';
import { UserService, CreateUserData, UpdateUserData, UserQueryOptions } from '../service/UserService';
import { validationResult } from 'express-validator';

export class UserController {
  /**
   * 创建用户
   */
  static async createUser(req: Request, res: Response) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const userData: CreateUserData = req.body;
      const user = await UserService.createUser(userData);

      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 根据ID获取用户
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取用户列表
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const options: UserQueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        role: req.query.role as 'admin' | 'user',
        sortBy: req.query.sortBy as 'id' | 'username' | 'email' | 'createdAt' || 'createdAt',
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC' || 'DESC'
      };

      const result = await UserService.getUsers(options);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(req: Request, res: Response) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const updateData: UpdateUserData = req.body;
      const user = await UserService.updateUser(userId, updateData);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户更新成功',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 删除用户（软删除）
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const success = await UserService.deleteUser(userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 永久删除用户
   */
  static async forceDeleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const success = await UserService.forceDeleteUser(userId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户永久删除成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 恢复已删除的用户
   */
  static async restoreUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const user = await UserService.restoreUser(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在或未被删除'
        });
      }

      res.json({
        success: true,
        message: '用户恢复成功',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 用户登录验证
   */
  static async login(req: Request, res: Response) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const user = await UserService.validatePassword(email, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      res.json({
        success: true,
        message: '登录成功',
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const stats = await UserService.getUserStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 批量删除用户
   */
  static async batchDeleteUsers(req: Request, res: Response) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的用户ID数组'
        });
      }

      const deletedCount = await UserService.batchDeleteUsers(ids);

      res.json({
        success: true,
        message: `成功删除 ${deletedCount} 个用户`,
        data: { deletedCount }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 更新用户角色
   */
  static async updateUserRole(req: Request, res: Response) {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { role } = req.body;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户角色'
        });
      }

      const user = await UserService.updateUserRole(userId, role);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '用户角色更新成功',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 根据邮箱获取用户
   */
  static async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: '请提供邮箱地址'
        });
      }

      const user = await UserService.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 根据用户名获取用户
   */
  static async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: '请提供用户名'
        });
      }

      const user = await UserService.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}