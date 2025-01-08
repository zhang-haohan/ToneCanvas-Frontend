# 使用一个轻量级的Node.js镜像来构建前端应用
FROM node:14 AS build

# 设置工作目录
WORKDIR /usr/src/app

# 复制前端代码到工作目录
COPY . .

# 安装依赖并构建项目
RUN npm install

# 使用一个轻量级的Nginx镜像来提供静态文件
FROM nginx:alpine

# 复制构建的静态文件到Nginx的HTML目录
COPY --from=build /usr/src/app/dist/ /usr/share/nginx/html

# 暴露应用端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
