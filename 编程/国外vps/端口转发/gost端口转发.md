---
创建时间: 星期日, 7月 7日 2024, 8:38 晚上
最近修改: 
---
项目文档：https://gost.run/

教程：# [Gost基础端口转发和内网穿透](https://wap-tw.181000.xyz/archives/gost-basic-use)



一键命令安装：
```
wget https://github.com/go-gost/gost/releases/download/v3.0.0-nightly.20240704/gost_3.0.0-nightly.20240704_linux_amd64.tar.gz -O gost.tar.gz && tar -xzf gost.tar.gz && chmod +x gost && sudo mv gost /usr/local/bin/ && rm gost.tar.gz

```
2.编写unit gost.service

```

```



常用命令：
```
 vim  /etc/systemd/system/gost.service  //查看gost系统级别配置
 sudo systemctl daemon-reload   //重新读取所有的配置文件
 goster install     //小工具
 ```
	
```

```

https://github.com/KANIKIG/Multi-EasyGost