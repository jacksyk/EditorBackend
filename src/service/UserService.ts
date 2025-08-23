import { User } from '../model/User';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'user';
  sortBy?: 'id' | 'username' | 'email' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export class UserService {
  /**
   * 创建新用户
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      // 检查邮箱是否已存在
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        throw new Error('邮箱已被注册');
      }

      // 检查用户名是否已存在
      const existingUsername = await User.findOne({
        where: { username: userData.username }
      });
      
      if (existingUsername) {
        throw new Error('用户名已被使用');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 创建用户
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user'
      });

      return user;
    } catch (error: any) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }

  /**
   * 根据ID获取用户
   */
  static async getUserById(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      return user;
    } catch (error: any) {
      throw new Error(`获取用户失败: ${error.message}`);
    }
  }

  /**
   * 根据邮箱获取用户
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] }
      });
      return user;
     } catch (error: any) {
       throw new Error(`获取用户失败: ${error.message}`);
     }
  }

  /**
   * 根据用户名获取用户
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ['password'] }
      });
      return user;
    } catch (error: any) {
      throw new Error(`获取用户失败: ${error.message}`);
    }
  }

  /**
   * 获取用户列表（支持分页、搜索、排序）
   */
  static async getUsers(options: UserQueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const whereConditions: any = {};

      // 搜索条件
      if (search) {
        whereConditions[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      // 角色筛选
      if (role) {
        whereConditions.role = role;
      }

      const { rows: users, count: total } = await User.findAndCountAll({
        where: whereConditions,
        attributes: { exclude: ['password'] },
        order: [[sortBy, sortOrder]],
        limit,
        offset
      });

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`获取用户列表失败: ${error.message}`);
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(id: number, updateData: UpdateUserData): Promise<User | null> {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('用户不存在');
      }

      // 如果更新邮箱，检查是否已存在
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: { 
            email: updateData.email,
            id: { [Op.ne]: id }
          }
        });
        
        if (existingUser) {
          throw new Error('邮箱已被其他用户使用');
        }
      }

      // 如果更新用户名，检查是否已存在
      if (updateData.username && updateData.username !== user.username) {
        const existingUsername = await User.findOne({
          where: { 
            username: updateData.username,
            id: { [Op.ne]: id }
          }
        });
        
        if (existingUsername) {
          throw new Error('用户名已被其他用户使用');
        }
      }

      // 如果更新密码，进行加密
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      // 更新用户
      await user.update(updateData);
      
      // 返回更新后的用户（不包含密码）
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      return updatedUser;
    } catch (error: any) {
      throw new Error(`更新用户失败: ${error.message}`);
    }
  }

  /**
   * 删除用户（软删除）
   */
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('用户不存在');
      }

      await user.destroy();
      return true;
    } catch (error: any) {
      throw new Error(`删除用户失败: ${error.message}`);
    }
  }

  /**
   * 永久删除用户
   */
  static async forceDeleteUser(id: number): Promise<boolean> {
    try {
      const user = await User.findByPk(id, { paranoid: false });
      
      if (!user) {
        throw new Error('用户不存在');
      }

      await user.destroy({ force: true });
      return true;
    } catch (error: any) {
      throw new Error(`永久删除用户失败: ${error.message}`);
    }
  }

  /**
   * 恢复已删除的用户
   */
  static async restoreUser(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id, { paranoid: false });
      
      if (!user) {
        throw new Error('用户不存在');
      }

      if (!user.deletedAt) {
        throw new Error('用户未被删除');
      }

      await user.restore();
      
      const restoredUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      return restoredUser;
    } catch (error: any) {
      throw new Error(`恢复用户失败: ${error.message}`);
    }
  }

  /**
   * 验证用户密码
   */
  static async validatePassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email }
      });
      
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return null;
      }

      // 返回用户信息（不包含密码）
      const userWithoutPassword = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });
      
      return userWithoutPassword;
    } catch (error: any) {
      throw new Error(`密码验证失败: ${error.message}`);
    }
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { deletedAt: null } });
      const deletedUsers = await User.count({ paranoid: false, where: { deletedAt: { [Op.ne]: null } } });
      const adminUsers = await User.count({ where: { role: 'admin' } });
      const regularUsers = await User.count({ where: { role: 'user' } });

      return {
        total: totalUsers,
        active: activeUsers,
        deleted: deletedUsers,
        admins: adminUsers,
        regular: regularUsers
      };
    } catch (error: any) {
      throw new Error(`获取用户统计失败: ${error.message}`);
    }
  }

  /**
   * 批量删除用户
   */
  static async batchDeleteUsers(ids: number[]): Promise<number> {
    try {
      const deletedCount = await User.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });
      
      return deletedCount;
    } catch (error: any) {
      throw new Error(`批量删除用户失败: ${error.message}`);
    }
  }

  /**
   * 更新用户角色
   */
  static async updateUserRole(id: number, role: 'admin' | 'user'): Promise<User | null> {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('用户不存在');
      }

      await user.update({ role });
      
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      return updatedUser;
    } catch (error: any) {
      throw new Error(`更新用户角色失败: ${error.message}`);
    }
  }
}