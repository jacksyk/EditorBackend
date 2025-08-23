import {
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Unique,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    DataType,
    BeforeCreate,
    BeforeUpdate,
    HasMany,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { Article } from './Article';

// 用户模型（对应数据库 users 表）
@Table({
    tableName: 'users', // 数据库表名
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
    paranoid: true // 软删除（添加 deletedAt 字段，不真正删除数据）
})
export class User extends Model {
    // 主键（自增）
    @PrimaryKey
    @AutoIncrement
    @Column
    id!: number;

    // 用户名（唯一、非空）
    @AllowNull(false)
    @Unique('username_unique')
    @Column({
        validate: {
            len: [3, 50] // 长度校验：3-50字符
        }
    })
    username!: string;

    // 邮箱（唯一、非空、格式校验）
    @AllowNull(false)
    @Unique('email_unique')
    @Column({
        validate: {
            isEmail: true // 邮箱格式校验
        }
    })
    email!: string;

    // 密码（非空，存储加密后的值）
    @AllowNull(false)
    @Column
    password!: string;

    // 角色（默认普通用户）
    @Column({
        type: DataType.ENUM('user', 'admin'),
        defaultValue: 'user'
    })
    role!: string;

    // 创建时间（自动生成）
    @CreatedAt
    createdAt!: Date;

    // 更新时间（自动生成）
    @UpdatedAt
    updatedAt!: Date;

    // 删除时间（软删除）
    @DeletedAt
    deletedAt!: Date;

    // 关联到Article模型（一个用户可以有多篇文章）
    @HasMany(() => Article)
    articles!: Article[];
    
    // 自定义方法：密码加密（保存前调用）
    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(user: User) {
        // 检查是否是新记录或密码字段已修改
        if (user.isNewRecord || user.previous('password') !== user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    }

    // 自定义方法：验证密码
    async validatePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password);
    }
}
