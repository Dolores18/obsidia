---
创建时间: 星期二, 7月 9日 2024, 12:37 下午
最近修改: 
---
```
//添加dns64

vim  /etc/resolv.conf

nameserver 2606:4700:4700::64
nameserver 2606:4700:4700::6400

//测试
dig AAAA ipv4only.arpa @2606:4700:4700::64



```