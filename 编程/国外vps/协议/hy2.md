---
创建时间: 星期四, 7月 4日 2024, 7:08 早上
最近修改: 
---
```

        + Take a look at the differences between Hysteria 2 and Hysteria 1 at https://hysteria.network/docs/misc/2-vs-1/
        + Check out the quick server config guide at https://hysteria.network/docs/getting-started/Server/
        + Edit server config file at /etc/hysteria/config.yaml
        + Start your hysteria server with systemctl start hysteria-server.service
        + Configure hysteria start on system boot with systemctl enable hysteria-server.service
```

运行服务器：
```
./hysteria-linux-amd64-avx server
./hysteria-linux-amd64-avx server -c hy2.yaml
#自定义文件名
```