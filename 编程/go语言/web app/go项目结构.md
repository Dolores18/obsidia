project-root/
  |- cmd/
  |  |- main.go          # 应用程序入口点，初始化和启动应用程序
  |
  |- controllers/
  |  |- user.go          # 处理与用户相关的HTTP请求
  |  |- auth.go          # 处理认证和授权相关的HTTP请求
  |
  |- services/
  |  |- user.go          # 用户服务逻辑，处理用户业务逻辑
  |  |- auth.go          # 认证服务逻辑，处理认证业务逻辑
  |
  |- dao/
  |  |- user.go          # 用户数据访问对象，执行数据库操作
  |
  |- middleware/
  |  |- logging.go       # 日志中间件，记录请求和响应信息
  |  |- auth.go          # 认证中间件，处理身份验证逻辑
  |
  |- models/
  |  |- user.go          # 用户模型，定义用户数据结构
  |
  |- config/
  |  |- config.go        # 应用程序的配置加载和管理
  |
  |- storage/
  |  |- uploads/         # 存储用户上传的文件
  |
  |- pkg/                # 公共的库代码，供整个应用程序使用
  |
  |- scripts/
  |  |- init_db.sh       # 初始化数据库脚本，创建数据库结构和初始数据
  |
  |- README.md           # 项目说明文档，包括项目概述、如何运行和使用等信息
