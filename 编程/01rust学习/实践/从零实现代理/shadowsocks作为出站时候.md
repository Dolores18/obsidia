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

总的过程
让我们梳理一下 `poll_forward_oneway` 函数在处理上行（uplink）数据时，与 Shadowsocks 出站和本地 流（local stream）的交互：

1. 首先，`poll_forward_oneway` 函数被调用，其中 `rx` 是本地流（local stream），`tx` 是 Shadowsocks 流。

2. 在 `ForwardState::AwatingSizeHint` 状态：
   - 调用 `rx.poll_request_size(cx)`，这是对本地流的调用，用于获取下一个数据块的大小提示。

3. 在 `ForwardState::PollingTxBuf` 状态：
   - 调用 `tx.poll_tx_buffer(cx, size_hint)`，这是对 Shadowsocks 流的调用，用于获取一个可写入的缓冲区。

4. 接下来，调用 `rx.commit_rx_buffer(buf)`，这是对本地流的调用，用于将数据从本地流读取到刚才获 取的缓冲区中。

5. 在 `ForwardState::PollingRxBuf` 状态：
   - 调用 `rx.poll_rx_buffer(cx)`，这是对本地流的调用，用于获取已经填充了数据的缓冲区。

6. 然后，调用 `tx.commit_tx_buffer(buf)`，这是对 Shadowsocks 流的调用，用于将数据写入 Shadowsocks 流中。

在这个过程中，Shadowsocks 出站工厂的主要作用是在创建 `tx` 流时进行初始化和加密设置。一旦 Shadowsocks 流被创建，`poll_forward_oneway` 函数就会像处理普通流一样处理它，但所有通过这个流发送的数 据都会被自动加密。

关键点：
- 数据并不是直接从本地流传递给 `tx.commit`。
- 而是先从本地流读取到一个中间缓冲区，然后这个缓冲区被传递给 Shadowsocks 流的 `commit_tx_buffer` 方法。
- Shadowsocks 流的 `commit_tx_buffer` 方法会在内部处理加密，然后将加密后的数据传递给下一层。

这个过程确保了数据在传输过程中被正确加密
