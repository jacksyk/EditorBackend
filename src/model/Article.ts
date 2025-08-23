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
    ForeignKey,
    BelongsTo,
    DataType
} from 'sequelize-typescript';
import { User } from './User';

// 文章模型（对应数据库 articles 表）
@Table({
    tableName: 'articles', // 数据库表名
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
    paranoid: true // 软删除（添加 deletedAt 字段，不真正删除数据）
})
export class Article extends Model {
    // 主键（自增）
    @PrimaryKey
    @AutoIncrement
    @Column
    id!: number;

    // 文章标题（唯一、非空）
    @AllowNull(false)
    @Unique("article_title")
    @Column({
        validate: {
            len: [3, 50] // 长度校验：3-50字符
        }
    })
    title!: string;

    // 文章内容（非空） 
    @AllowNull(false)
    @Unique("article_content")
    @Column
    content!: string;

    // 文章作者ID（外键关联到User表）
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    userId!: number;

    // 关联到User模型
    @BelongsTo(() => User)
    user!: User;

    // 创建时间（自动生成）
    @CreatedAt
    createdAt!: Date;

    // 更新时间（自动生成）
    @UpdatedAt
    updatedAt!: Date;

    // 删除时间（软删除）
    @DeletedAt
    deletedAt!: Date;
}
