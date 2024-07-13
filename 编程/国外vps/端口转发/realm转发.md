---
创建时间: 星期一, 7月 8日 2024, 3:52 凌晨
最近修改:
---
[[彭于晏の教程]]1分钟快速手搓Realm(https://www.nodeseek.com/post-49959-1)

[用ws隧道转发](https://github.com/zhboner/realm/blob/master/examples/ws.toml)

[real转发教程](https://cnix.win/225.html)

WS没有加密，WSS和TLS才有加密

```
sudo cat > /etc/systemd/system/realm.service << EOF
[Unit]
Description=Realm Service
After=network.target

[Service]
ExecStart=/usr/local/bin/realm -c /etc/realm/config.json
Restart=on-failure
RestartSec=10s
User=nobody
Group=nogroup
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

```
apine安装
```
sudo cat > /etc/init.d/sing-box << EOF
#!/sbin/openrc-run

name="sing-box"
description="Sing-Box Service"
command="/usr/local/bin/sing-box"
command_args="run -c /etc/sing-box/config.json"
command_background="yes"
pidfile="/run/\${RC_SVCNAME}.pid"
output_log="/var/log/sing-box.log"
error_log="/var/log/sing-box.err"

depend() {
    need net
    after firewall
}

start_pre() {
    checkpath --directory --owner root:root --mode 0755 /run
    checkpath --file --owner root:root --mode 0644 \$output_log \$error_log
}
EOF

```