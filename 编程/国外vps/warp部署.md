---
创建时间: 星期二, 7月 2日 2024, 7:47 早上
最近修改: 
---
[关于自己VPS访问不了openai.com的解决办法](https://linux.do/t/topic/113189)

https://github.com/TunMax/canal
一个开箱即用的 http / socks5 代理（基于 Cloudflare WARP）
Setting Up an Out of Box HTTP/SOCKS5 Proxy with Cloudflare WARP in Docker

一键脚本
https://gitlab.com/fscarmen/warp

解锁netflix脚本
https://github.com/fscarmen/unlock_warp

配置
https://diazepam.cc/post/route-remote/
## 原理

**naive** -> **caddy** (forward_proxy) -> socks5h://127.0.0.1:10000 (inbound) **sing-box** (outbound) **WARP** (socks5h://127.0.0.1:40000) OR **Direct**


[warpgo使用](https://gitlab.com/ProjectWARP/warp-go/-/blob/master/README.zh_CN.md)

[v2ray + warp-go 非全局使用 Cloudflare WARP 解锁 New Bing 等服务](https://blog.skyju.cc/post/v2ray-warp-go-unlock-new-bing/)

sing box配置
https://github.com/chika0801/sing-box-examples/blob/main/wireguard.md