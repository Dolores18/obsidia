---
创建时间: 星期一, 6月 17日 2024, 12:49:29 凌晨
最近修改: 星期四, 6月 20日 2024, 12:30:07 下午
---
目录：/var/www/html

目录结构：
```
/var/www/html
|-- index.html
|-- about.html
|-- styles
|   |-- main.css
|-- scripts
|   |-- app.js
|-- images
|   |-- logo.png
|   |-- banner.jpg

```

nginx配置相关：
```
server
{
    #listen [::]:80;   #监听端口 IPv6
    #listen [::]:443 ssl;    #监听端口 带SSL iPv6
    listen 80; #ipv4
    listen 443 ssl;  #ipv4
    server_name yourexampleweb; #填写监控网站域名
    root /var/www/html;     #路由地址，就是指向的文件
    index index.html index.htm;   
    autoindex on;  #自动索引
    #index root部分随便写 没用的
    
    #SSL-START SSL相关配置，请勿删除或修改下一行带注释的404规则
    #error_page 404/404.html;
    ssl_certificate     /etc/letsencrypt/live/example;   #SSL证书文件
    ssl_certificate_key    /etc/letsencrypt/live/example;  #SSL密钥文件
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000";
    error_page 497  https://$host$request_uri;
 
#以下是反代内容 如果有特别设置端口记得修改 
   
    location / {
        try_files $uri $uri/ =404;
    }
}
```
注意：配置一定要按照顺序 

# 权限设置，避免恶意
```
chmod -R 755 /to/your/path  #只读权限

```