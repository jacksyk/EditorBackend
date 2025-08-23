import { Article } from '../model/Article';
import { User } from '../model/User';
import { Op } from 'sequelize';

// 创建文章数据接口
export interface CreateArticleData {
  title: string;
  content: string;
  userId: number;
}

// 更新文章数据接口
export interface UpdateArticleData {
  title?: string;
  content?: string;
}

// 文章查询选项接口
export interface ArticleQueryOptions {
  page?: number;
  limit?: number;
  userId?: number;
  title?: string;
  sortBy?: 'id' | 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  includeDeleted?: boolean;
}

export class ArticleService {
  /**
   * 创建文章
   */
  static async createArticle(articleData: CreateArticleData): Promise<Article> {
    try {
      // 验证用户是否存在
      const user = await User.findByPk(articleData.userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 检查标题是否已存在
      const existingArticle = await Article.findOne({
        where: { title: articleData.title }
      });
      if (existingArticle) {
        throw new Error('文章标题已存在');
      }

      const article = await Article.create(articleData as any);
      return article;
    } catch (error: any) {
      throw new Error(`创建文章失败: ${error.message}`);
    }
  }

  /**
   * 根据ID获取文章
   */
  static async getArticleById(id: number, includeUser: boolean = true): Promise<Article | null> {
    try {
      const options: any = {
        where: { id }
      };

      if (includeUser) {
        options.include = [{
          model: User,
          attributes: ['id', 'username', 'email']
        }];
      }

      return await Article.findByPk(id, options);
    } catch (error: any) {
      throw new Error(`获取文章失败: ${error.message}`);
    }
  }

  /**
   * 获取文章列表
   */
  static async getArticles(options: ArticleQueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        title,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        includeDeleted = false
      } = options;

      const offset = (page - 1) * limit;
      const whereConditions: any = {};

      // 添加用户ID过滤
      if (userId) {
        whereConditions.userId = userId;
      }

      // 添加标题搜索
      if (title) {
        whereConditions.title = {
          [Op.like]: `%${title}%`
        };
      }

      const queryOptions: any = {
        where: whereConditions,
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }],
        order: [[sortBy, sortOrder]],
        limit,
        offset
      };

      // 是否包含已删除的记录
      if (includeDeleted) {
        queryOptions.paranoid = false;
      }

      const { count, rows } = await Article.findAndCountAll(queryOptions);

      return {
        articles: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`获取文章列表失败: ${error.message}`);
    }
  }

  /**
   * 更新文章
   */
  static async updateArticle(id: number, updateData: UpdateArticleData, userId?: number): Promise<Article> {
    try {
      const article = await Article.findByPk(id);
      if (!article) {
        throw new Error('文章不存在');
      }

      // 如果提供了userId，验证是否为文章作者
      if (userId && article.userId !== userId) {
        throw new Error('无权限修改此文章');
      }

      // 如果更新标题，检查是否与其他文章重复
      if (updateData.title && updateData.title !== article.title) {
        const existingArticle = await Article.findOne({
          where: {
            title: updateData.title,
            id: { [Op.ne]: id }
          }
        });
        if (existingArticle) {
          throw new Error('文章标题已存在');
        }
      }

      await article.update(updateData);
      return article;
    } catch (error: any) {
      throw new Error(`更新文章失败: ${error.message}`);
    }
  }

  /**
   * 删除文章（软删除）
   */
  static async deleteArticle(id: number, userId?: number): Promise<void> {
    try {
      const article = await Article.findByPk(id);
      if (!article) {
        throw new Error('文章不存在');
      }

      // 如果提供了userId，验证是否为文章作者
      if (userId && article.userId !== userId) {
        throw new Error('无权限删除此文章');
      }

      await article.destroy();
    } catch (error: any) {
      throw new Error(`删除文章失败: ${error.message}`);
    }
  }

  /**
   * 永久删除文章
   */
  static async forceDeleteArticle(id: number): Promise<void> {
    try {
      const article = await Article.findByPk(id, { paranoid: false });
      if (!article) {
        throw new Error('文章不存在');
      }

      await article.destroy({ force: true });
    } catch (error: any) {
      throw new Error(`永久删除文章失败: ${error.message}`);
    }
  }

  /**
   * 恢复已删除的文章
   */
  static async restoreArticle(id: number): Promise<Article> {
    try {
      const article = await Article.findByPk(id, { paranoid: false });
      if (!article) {
        throw new Error('文章不存在');
      }

      if (!article.deletedAt) {
        throw new Error('文章未被删除');
      }

      await article.restore();
      return article;
    } catch (error: any) {
      throw new Error(`恢复文章失败: ${error.message}`);
    }
  }

  /**
   * 批量删除文章
   */
  static async batchDeleteArticles(ids: number[], userId?: number): Promise<number> {
    try {
      const whereConditions: any = {
        id: { [Op.in]: ids }
      };

      // 如果提供了userId，只删除该用户的文章
      if (userId) {
        whereConditions.userId = userId;
      }

      const deletedCount = await Article.destroy({
        where: whereConditions
      });

      return deletedCount;
    } catch (error: any) {
      throw new Error(`批量删除文章失败: ${error.message}`);
    }
  }

  /**
   * 获取文章统计信息
   */
  static async getArticleStats(userId?: number) {
    try {
      const whereConditions: any = {};
      if (userId) {
        whereConditions.userId = userId;
      }

      const [total, totalWithDeleted] = await Promise.all([
        Article.count({ where: whereConditions }),
        Article.count({ 
          where: whereConditions,
          paranoid: false
        })
      ]);
      
      const deleted = totalWithDeleted - total;

      return {
        total,
        active: total,
        deleted
      };
    } catch (error: any) {
      throw new Error(`获取文章统计失败: ${error.message}`);
    }
  }

  /**
   * 根据用户ID获取文章列表
   */
  static async getArticlesByUserId(userId: number, options: Omit<ArticleQueryOptions, 'userId'> = {}) {
    return this.getArticles({ ...options, userId });
  }

  /**
   * 搜索文章
   */
  static async searchArticles(keyword: string, options: ArticleQueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const whereConditions: any = {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } }
        ]
      };

      if (userId) {
        whereConditions.userId = userId;
      }

      const { count, rows } = await Article.findAndCountAll({
        where: whereConditions,
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }],
        order: [[sortBy, sortOrder]],
        limit,
        offset
      });

      return {
        articles: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`搜索文章失败: ${error.message}`);
    }
  }
}