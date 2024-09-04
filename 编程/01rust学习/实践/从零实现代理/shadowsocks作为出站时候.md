当加入Shadowsocks出站时，在forward的uplink分支的fetch_one_way函数中，主要涉及以下Shadowsocks的 方法和作用:

1. `ShadowsocksStreamOutboundFactory::create_outbound`:
   - 作用: 创建Shadowsocks出站连接
   - 过程:
     a. 生成随机IV
     b. 加密目标地址和初始数据
     c. 调用下一级出站工厂创建实际网络连接
     d. 返回封装了加密逻辑的ShadowsocksStream

2. `ShadowsocksStream::poll_tx_buffer`:
   - 作用: 获取发送缓冲区
   - 过程:
     a. 从下层流获取缓冲区
     b. 预留Shadowsocks加密开销的空间

3. `ShadowsocksStream::commit_tx_buffer`:
   - 作用: 加密并发送数据
   - 过程:
     a. 使用tx_crypto加密数据
     b. 添加必要的加密头部和尾部
     c. 调用下层流发送加密后的数据

4. `ShadowsocksStream::poll_flush_tx`:
   - 作用: 刷新发送缓冲区
   - 过程: 调用下层流的flush方法

5. `ShadowsocksStream::poll_close_tx`:
   - 作用: 关闭发送通道
   - 过程: 调用下层流的close方法
