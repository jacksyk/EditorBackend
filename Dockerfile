# ============================================
# Editor-Backend Docker 配置文件
# 用于构建Node.js后端应用的生产环境镜像
# ============================================

# 使用官方Node.js 18 LTS Alpine镜像作为基础镜像
# Alpine版本体积更小，安全性更高，适合生产环境
FROM node:18-alpine

# 设置容器内的工作目录
# 所有后续操作都在此目录下进行
WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production

# 首先复制package.json和锁定文件
# 利用Docker层缓存机制，只有依赖变化时才重新安装
COPY package.json pnpm-lock.yaml* ./

# 安装pnpm包管理器并安装项目依赖
# --frozen-lockfile确保使用锁定文件中的确切版本
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 复制项目源代码到容器中
# .dockerignore文件会排除不必要的文件
COPY . .

# 编译TypeScript项目到JavaScript
# 生成的文件将存放在dist目录中
RUN pnpm run build

# 创建非特权用户组和用户
# 提高容器安全性，避免使用root用户运行应用
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 将应用目录的所有权转移给nodejs用户
# 确保应用有足够的权限读写必要文件
RUN chown -R nodejs:nodejs /app

# 切换到非特权用户
# 后续所有操作都以nodejs用户身份执行
USER nodejs

# 暴露应用端口
# 告诉Docker该容器监听3000端口
EXPOSE 3000

# 直接使用node启动编译后的应用
CMD ["node", "dist/app/app.js"]