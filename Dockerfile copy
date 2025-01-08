# 使用一个简单的Node.js镜像
FROM node:14

# 设置工作目录
WORKDIR /usr/src/app

# 复制前端代码到工作目录
COPY . .

# 安装依赖
RUN npm install

# 构建项目（假设你使用Webpack构建项目）
RUN npm run build

# 安装http-server
RUN npm install -g http-server

# 暴露应用端口
EXPOSE 8080

# 启动http-server，服务dist目录
CMD ["http-server", "dist", "-p", "8080"]
