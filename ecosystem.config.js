/**
 * ============================================
 * PM2 进程管理器配置文件
 * 用于管理Editor-Backend应用的进程生命周期
 * ============================================
 */

module.exports = {
  apps: [{
    // ========== 基本配置 ==========
    name: 'editor-backend',              // 应用名称，用于PM2进程标识
    script: './dist/app/app.js',         // 应用入口文件（编译后的JavaScript文件）
    
    // ========== 集群配置 ==========
    instances: 'max',                    // 启动实例数量：'max'表示使用所有可用CPU核心
    exec_mode: 'cluster',                // 执行模式：cluster集群模式，提供负载均衡
    
    // ========== 监控配置 ==========
    watch: false,                        // 生产环境关闭文件监听，避免不必要的重启
    max_memory_restart: '1G',            // 内存使用超过1GB时自动重启进程
    
    // ========== 环境变量配置 ==========
    env: {
      NODE_ENV: 'production',            // 生产环境标识
      PORT: 3000                         // 应用监听端口
    },
    env_development: {
      NODE_ENV: 'development',           // 开发环境标识
      PORT: 3000,                        // 开发环境端口
      watch: true,                       // 开发环境启用文件监听
      ignore_watch: [                    // 忽略监听的目录和文件
        'node_modules',                  // 依赖包目录
        'logs',                          // 日志目录
        'dist'                           // 编译输出目录
      ]
    },
    
    // ========== 日志配置 ==========
    error_file: './logs/pm2-error.log',      // 错误日志文件路径
    out_file: './logs/pm2-out.log',          // 标准输出日志文件路径
    log_file: './logs/pm2-combined.log',     // 合并日志文件路径
    time: true,                              // 在日志中添加时间戳
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z', // 日志时间格式
    merge_logs: true,                        // 合并所有集群实例的日志
    
    // ========== 重启策略配置 ==========
    autorestart: true,                       // 启用自动重启
    max_restarts: 10,                        // 最大重启次数（防止无限重启）
    min_uptime: '10s',                       // 最小运行时间（低于此时间重启视为异常）
    restart_delay: 4000                      // 重启延迟时间（毫秒）
  }]
};

/**
 * 使用说明：
 * 
 * 1. 启动应用：pm2 start ecosystem.config.js
 * 2. 重启应用：pm2 restart ecosystem.config.js
 * 3. 停止应用：pm2 stop ecosystem.config.js
 * 4. 删除应用：pm2 delete ecosystem.config.js
 * 5. 查看状态：pm2 status
 * 6. 查看日志：pm2 logs editor-backend
 * 7. 监控面板：pm2 monit
 * 
 * 环境切换：
 * - 生产环境：pm2 start ecosystem.config.js --env production
 * - 开发环境：pm2 start ecosystem.config.js --env development
 */