---
创建时间: 星期三, 6月 19日 2024, 7:37:55 晚上
最近修改: 星期四, 6月 20日 2024, 1:40:10 下午
---
#  教程
[第二代hysteria节点搭建教程第一次投稿哈哈哈](https://linux.do/t/topic/35321)
[关于科学上网及自建的心路历程](https://linux.do/t/topic/98954)


感想：
知道这样搭建之后，就算以后不联网也行。

1. 一键安装Hysteria2
```
apt-get update
bash <(curl -fsSL https://get.hy2.sh/)
```
2.设置为开机自启
```
systemctl enable hysteria-server.service
```
3.配置文件
```
#/etc/hysteria/config.yaml
listen: :443 #监听端口

#使用CA证书
#acme:
#  domains:
#    - a.com #你的域名，需要先解析到服务器ip
#  email: test@sharklasers.com

#使用自签证书
tls:
  cert: /etc/hysteria/server.crt
  key: /etc/hysteria/server.key

auth:
  type: password
  password: vhgg7MvH9Kzda76sqlxhsFyj #设置认证密码
  
masquerade:
  type: proxy
  proxy:
    url: https://bing.com #伪装网址
    rewriteHost: true
```
4.添加端口
```
ufw allow 80/tcp
ufw allow 443/tcp
```


二.客户端

![v2ragn配置](https://cdn.linux.do/uploads/default/optimized/3X/c/b/cb0c40158e2e656f3f988b9e1598b15559d06247_2_1035x736.png)