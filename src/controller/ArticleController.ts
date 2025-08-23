import { Request, Response } from 'express';
import { ArticleService, CreateArticleData, UpdateArticleData, ArticleQueryOptions } from '../service/ArticleService';
import { validationResult } from 'express-validator';

export class ArticleController {
  /**
   * 创建文章
   */
  static async createArticle(req: Request, res: Response) {
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

      const articleData: CreateArticleData = req.body;
      const article = await ArticleService.createArticle(articleData);

      res.status(201).json({
        success: true,
        message: '文章创建成功',
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          userId: article.userId,
          createdAt: article.createdAt
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
   * 根据ID获取文章
   */
  static async getArticleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文章ID'
        });
      }

      const article = await ArticleService.getArticleById(articleId);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: '文章不存在'
        });
      }

      res.json({
        success: true,
        data: article
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取文章列表
   */
  static async getArticles(req: Request, res: Response) {
    try {
      const options: ArticleQueryOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        title: req.query.title as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC',
        includeDeleted: req.query.includeDeleted === 'true'
      };

      const result = await ArticleService.getArticles(options);

      res.json({
        success: true,
        data: result.articles,
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
   * 更新文章
   */
  static async updateArticle(req: Request, res: Response) {
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
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文章ID'
        });
      }

      const updateData: UpdateArticleData = req.body;
      // 可以从认证中间件获取当前用户ID，这里暂时不做权限验证
      const userId = req.body.currentUserId; // 实际项目中应该从JWT token获取
      
      const article = await ArticleService.updateArticle(articleId, updateData, userId);

      res.json({
        success: true,
        message: '文章更新成功',
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          userId: article.userId,
          updatedAt: article.updatedAt
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
   * 删除文章（软删除）
   */
  static async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文章ID'
        });
      }

      // 可以从认证中间件获取当前用户ID
      const userId = req.body.currentUserId; // 实际项目中应该从JWT token获取
      
      await ArticleService.deleteArticle(articleId, userId);

      res.json({
        success: true,
        message: '文章删除成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 永久删除文章
   */
  static async forceDeleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文章ID'
        });
      }

      await ArticleService.forceDeleteArticle(articleId);

      res.json({
        success: true,
        message: '文章永久删除成功'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 恢复已删除的文章
   */
  static async restoreArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文章ID'
        });
      }

      const article = await ArticleService.restoreArticle(articleId);

      res.json({
        success: true,
        message: '文章恢复成功',
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          userId: article.userId
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
   * 批量删除文章
   */
  static async batchDeleteArticles(req: Request, res: Response) {
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
      // 可以从认证中间件获取当前用户ID
      const userId = req.body.currentUserId; // 实际项目中应该从JWT token获取
      
      const deletedCount = await ArticleService.batchDeleteArticles(ids, userId);

      res.json({
        success: true,
        message: `成功删除 ${deletedCount} 篇文章`,
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
   * 获取文章统计信息
   */
  static async getArticleStats(req: Request, res: Response) {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const stats = await ArticleService.getArticleStats(userId);

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
   * 根据用户ID获取文章列表
   */
  static async getArticlesByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userIdNum = parseInt(userId);

      if (isNaN(userIdNum)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户ID'
        });
      }

      const options: Omit<ArticleQueryOptions, 'userId'> = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        title: req.query.title as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC'
      };

      const result = await ArticleService.getArticlesByUserId(userIdNum, options);

      res.json({
        success: true,
        data: result.articles,
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
   * 搜索文章
   */
  static async searchArticles(req: Request, res: Response) {
    try {
      const { keyword } = req.query;

      if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({
          success: false,
          message: '请提供搜索关键词'
        });
      }

      const options: ArticleQueryOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC'
      };

      const result = await ArticleService.searchArticles(keyword, options);

      res.json({
        success: true,
        data: result.articles,
        pagination: result.pagination,
        keyword
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}