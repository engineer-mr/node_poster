# Poster API

## 安装

```bash
npm install
```

## 启动（本地直接 npm run start ）

```bash
npm install -g pm2
PORT=3000 pm2 start index.js --name poster-api-3000 -- --server
pm2 save
```
### 端口说明（注意开放 3000 端口或者改为其他端口）

## 生成本地文件

```bash
npm run generate 
```

## 调用（png）

```text
http://你的域名/poster.png?title=%E5%A4%8F%E6%97%A5%E6%96%B0%E5%93%81%E5%8F%91%E5%B8%83%E4%BC%9A&subtitle=SUMMER%20LAUNCH%202026&date=Mr.Li&location=1752146907
```

## 调用（svg）

```text
http://你的域名/poster.svg?title=%E5%A4%8F%E6%97%A5%E6%96%B0%E5%93%81%E5%8F%91%E5%B8%83%E4%BC%9A&subtitle=SUMMER%20LAUNCH%202026&date=Mr.Li&location=1752146907
```


## 字体说明

如果部署到服务器后中文乱码，先安装中文字体（svg正常，png会中文乱码）。
