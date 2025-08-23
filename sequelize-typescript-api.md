# Sequelize-TypeScript API 参考文档

## 目录
- [模型装饰器](#模型装饰器)
- [字段装饰器](#字段装饰器)
- [关联装饰器](#关联装饰器)
- [生命周期钩子](#生命周期钩子)
- [查询操作](#查询操作)
- [事务操作](#事务操作)
- [验证器](#验证器)

## 模型装饰器

### @Table
定义数据库表的基本配置

```typescript
@Table({
  tableName: 'users',        // 表名
  timestamps: true,          // 自动添加 createdAt/updatedAt
  paranoid: true,           // 软删除（添加 deletedAt）
  underscored: true,        // 使用下划线命名
  freezeTableName: true,    // 禁用表名复数化
  indexes: [                // 索引定义
    {
      unique: true,
      fields: ['email']
    }
  ]
})
export class User extends Model {}
```

## 字段装饰器

### @Column
定义表字段

```typescript
// 基本用法
@Column
name: string;

// 带配置
@Column({
  type: DataType.STRING(100),
  allowNull: false,
  defaultValue: 'default',
  unique: true,
  comment: '字段注释'
})
name: string;
```

### @PrimaryKey
定义主键

```typescript
@PrimaryKey
@AutoIncrement
@Column
id: number;
```

### @AutoIncrement
自增字段

```typescript
@AutoIncrement
@Column
id: number;
```

### @AllowNull
允许/禁止 NULL 值

```typescript
@AllowNull(false)
@Column
name: string;
```

### @Unique
唯一约束

```typescript
@Unique
@Column
email: string;

// 复合唯一约束
@Unique('unique_name_age')
@Column
name: string;

@Unique('unique_name_age')
@Column
age: number;
```

### @Default
默认值

```typescript
@Default('active')
@Column
status: string;

@Default(DataType.NOW)
@Column
createdAt: Date;
```

### 时间戳装饰器

```typescript
@CreatedAt
createdAt: Date;

@UpdatedAt
updatedAt: Date;

@DeletedAt
deletedAt: Date;
```

## 关联装饰器

### @HasMany
一对多关联

```typescript
@HasMany(() => Article)
articles: Article[];

// 带配置
@HasMany(() => Article, {
  foreignKey: 'userId',
  as: 'userArticles'
})
articles: Article[];
```

### @BelongsTo
多对一关联

```typescript
@BelongsTo(() => User)
user: User;

@ForeignKey(() => User)
@Column
userId: number;
```

### @BelongsToMany
多对多关联

```typescript
@BelongsToMany(() => Article, () => UserToArticle)
articles: Article[];
```

### @HasOne
一对一关联

```typescript
@HasOne(() => Profile)
profile: Profile;
```

### @ForeignKey
外键

```typescript
@ForeignKey(() => User)
@Column
userId: number;
```

## 生命周期钩子

### 创建前后

```typescript
@BeforeCreate
static async hashPassword(user: User) {
  user.password = await bcrypt.hash(user.password, 10);
}

@AfterCreate
static async sendWelcomeEmail(user: User) {
  // 发送欢迎邮件
}
```

### 更新前后

```typescript
@BeforeUpdate
static async validateUpdate(user: User) {
  // 更新前验证
}

@AfterUpdate
static async logUpdate(user: User) {
  // 记录更新日志
}
```

### 删除前后

```typescript
@BeforeDestroy
static async cleanupRelations(user: User) {
  // 清理关联数据
}

@AfterDestroy
static async logDeletion(user: User) {
  // 记录删除日志
}
```

### 验证钩子

```typescript
@BeforeValidate
static async normalizeEmail(user: User) {
  user.email = user.email.toLowerCase();
}

@AfterValidate
static async checkDuplicates(user: User) {
  // 检查重复数据
}
```

## 查询操作

### 基本查询

```typescript
// 查找所有
const users = await User.findAll();

// 根据主键查找
const user = await User.findByPk(1);

// 查找一个
const user = await User.findOne({
  where: { email: 'test@example.com' }
});

// 查找或创建
const [user, created] = await User.findOrCreate({
  where: { email: 'test@example.com' },
  defaults: { name: 'Test User' }
});
```

### 条件查询

```typescript
import { Op } from 'sequelize';

// 基本条件
const users = await User.findAll({
  where: {
    age: {
      [Op.gte]: 18,
      [Op.lte]: 65
    },
    name: {
      [Op.like]: '%john%'
    },
    status: {
      [Op.in]: ['active', 'pending']
    }
  }
});

// 复杂条件
const users = await User.findAll({
  where: {
    [Op.or]: [
      { name: 'John' },
      { email: 'john@example.com' }
    ],
    [Op.and]: [
      { age: { [Op.gte]: 18 } },
      { status: 'active' }
    ]
  }
});
```

### 关联查询

```typescript
// 包含关联数据
const users = await User.findAll({
  include: [Article]
});

// 带条件的关联查询
const users = await User.findAll({
  include: [{
    model: Article,
    where: { published: true },
    required: false // LEFT JOIN
  }]
});

// 嵌套关联
const users = await User.findAll({
  include: [{
    model: Article,
    include: [Comment]
  }]
});
```

### 排序和分页

```typescript
// 排序
const users = await User.findAll({
  order: [
    ['createdAt', 'DESC'],
    ['name', 'ASC']
  ]
});

// 分页
const users = await User.findAndCountAll({
  limit: 10,
  offset: 20
});

// 字段选择
const users = await User.findAll({
  attributes: ['id', 'name', 'email']
});

// 排除字段
const users = await User.findAll({
  attributes: { exclude: ['password'] }
});
```

### 聚合查询

```typescript
// 计数
const count = await User.count({
  where: { status: 'active' }
});

// 求和
const sum = await User.sum('age', {
  where: { status: 'active' }
});

// 最大值/最小值
const max = await User.max('age');
const min = await User.min('age');

// 分组聚合
const result = await User.findAll({
  attributes: [
    'status',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['status']
});
```

## 创建和更新

### 创建记录

```typescript
// 创建单个记录
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// 批量创建
const users = await User.bulkCreate([
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' }
]);
```

### 更新记录

```typescript
// 更新实例
const user = await User.findByPk(1);
user.name = 'New Name';
await user.save();

// 批量更新
await User.update(
  { status: 'inactive' },
  { where: { lastLogin: { [Op.lt]: new Date('2023-01-01') } } }
);

// upsert（更新或插入）
const [user, created] = await User.upsert({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
});
```

### 删除记录

```typescript
// 删除实例
const user = await User.findByPk(1);
await user.destroy();

// 批量删除
await User.destroy({
  where: { status: 'inactive' }
});

// 强制删除（忽略软删除）
await user.destroy({ force: true });

// 恢复软删除的记录
await user.restore();
```

## 事务操作

### 自动管理事务

```typescript
import { sequelize } from './database';

const result = await sequelize.transaction(async (t) => {
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com'
  }, { transaction: t });

  const article = await Article.create({
    title: 'My Article',
    userId: user.id
  }, { transaction: t });

  return { user, article };
});
```

### 手动管理事务

```typescript
const t = await sequelize.transaction();

try {
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com'
  }, { transaction: t });

  const article = await Article.create({
    title: 'My Article',
    userId: user.id
  }, { transaction: t });

  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

## 验证器

### 内置验证器

```typescript
@Column({
  validate: {
    isEmail: true,              // 邮箱格式
    isUrl: true,                // URL 格式
    isIP: true,                 // IP 地址
    isAlpha: true,              // 只包含字母
    isAlphanumeric: true,       // 只包含字母和数字
    isNumeric: true,            // 只包含数字
    isInt: true,                // 整数
    isFloat: true,              // 浮点数
    isDecimal: true,            // 十进制数
    isLowercase: true,          // 小写
    isUppercase: true,          // 大写
    notNull: true,              // 非空
    notEmpty: true,             // 非空字符串
    len: [2, 10],              // 长度范围
    min: 0,                    // 最小值
    max: 100,                  // 最大值
    is: /^[a-z]+$/i,           // 正则表达式
    not: /[a-z]/i,             // 不匹配正则
    isIn: [['male', 'female']], // 在指定值中
    notIn: [['admin']],         // 不在指定值中
    contains: 'foo',           // 包含子串
    notContains: 'bar',        // 不包含子串
    isDate: true,              // 日期格式
    isAfter: '2023-01-01',     // 日期之后
    isBefore: '2024-01-01'     // 日期之前
  }
})
field: string;
```

### 自定义验证器

```typescript
@Column({
  validate: {
    // 自定义验证函数
    isEven(value: number) {
      if (value % 2 !== 0) {
        throw new Error('必须是偶数');
      }
    },
    // 异步验证
    async isUniqueEmail(value: string) {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        throw new Error('邮箱已存在');
      }
    }
  }
})
field: string;
```

## 数据类型

### 常用数据类型

```typescript
import { DataType } from 'sequelize-typescript';

@Column(DataType.STRING)           // VARCHAR(255)
@Column(DataType.STRING(100))      // VARCHAR(100)
@Column(DataType.TEXT)             // TEXT
@Column(DataType.INTEGER)          // INTEGER
@Column(DataType.BIGINT)           // BIGINT
@Column(DataType.FLOAT)            // FLOAT
@Column(DataType.DOUBLE)           // DOUBLE
@Column(DataType.DECIMAL(10, 2))   // DECIMAL(10,2)
@Column(DataType.BOOLEAN)          // BOOLEAN
@Column(DataType.DATE)             // DATETIME
@Column(DataType.DATEONLY)         // DATE
@Column(DataType.TIME)             // TIME
@Column(DataType.JSON)             // JSON
@Column(DataType.JSONB)            // JSONB (PostgreSQL)
@Column(DataType.BLOB)             // BLOB
@Column(DataType.UUID)             // UUID
@Column(DataType.ENUM('a', 'b'))   // ENUM
```

## 实用工具

### 模型同步

```typescript
// 同步所有模型
await sequelize.sync();

// 强制重新创建表
await sequelize.sync({ force: true });

// 只在表不存在时创建
await sequelize.sync({ alter: true });
```

### 原始查询

```typescript
// 执行原始 SQL
const [results, metadata] = await sequelize.query(
  'SELECT * FROM users WHERE age > ?',
  {
    replacements: [18],
    type: QueryTypes.SELECT
  }
);

// 使用模型映射结果
const users = await sequelize.query(
  'SELECT * FROM users',
  {
    model: User,
    mapToModel: true
  }
);
```

### 连接池配置

```typescript
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  database: 'mydb',
  username: 'user',
  password: 'pass',
  pool: {
    max: 10,        // 最大连接数
    min: 0,         // 最小连接数
    acquire: 30000, // 获取连接超时时间
    idle: 10000     // 连接空闲时间
  }
});
```

## 最佳实践

1. **使用 TypeScript 严格模式**：启用 `strictPropertyInitialization`
2. **属性初始化**：使用 `!` 断言或提供默认值
3. **关联定义**：在模型中明确定义所有关联关系
4. **事务使用**：对于复杂操作使用事务确保数据一致性
5. **索引优化**：为经常查询的字段添加索引
6. **验证器**：使用内置验证器和自定义验证器确保数据质量
7. **连接池**：合理配置连接池参数
8. **错误处理**：妥善处理数据库操作异常

---

更多详细信息请参考 [Sequelize-TypeScript 官方文档](https://github.com/sequelize/sequelize-typescript)