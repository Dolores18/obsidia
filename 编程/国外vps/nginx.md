# 把监听端口改掉

sed -i 's/listen 80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# 重新加载
systemctl reload nginx

systemctl restart nginx

1.找到配置文件
nginx -V

2.检查配置文件是否正确
nginx -t

3.修改了配置文件都需要重新加载
nginx -s reload

4.查看nginx的进程
ps aux | grep nginx