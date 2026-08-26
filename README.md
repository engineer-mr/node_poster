
## 使用方式
 cd 你的目录
 npm install qrcode
 npm install -g pm2
 PORT=3000 pm2 start index.js --name poster-api -- --server
 pm2 save

##  外网调用就是：
 http:你的域名/poster.svg?title=%E5%A4%8F%E6%97%A5%E6%96%B0%E5%93%81%E5%8F%91%E5%B8%83%E4%BC%9A&subtitle=SUMMER%20LAUNCH%202026&date=Mr.Li&location=1752146907

