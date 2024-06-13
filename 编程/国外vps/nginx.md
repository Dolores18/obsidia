# 把监听端口改掉

sed -i 's/listen 80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# 重新加载
systemctl reload nginx

systemctl restart nginx