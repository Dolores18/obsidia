在这段代码中，当处理下行（downlink）流量时，主要涉及以下流程：

1. 从出站工厂（remote stream）读取数据
2. 将数据写入入站工厂（local stream）

具体函数调用流程如下：

1. 出站工厂（remote stream）:
   a. `poll_request_size`: 询问需要多少数据
   b. `poll_rx_buffer`: 获取接收缓冲区
   c. `commit_rx_buffer`: 提交接收到的数据

2. 入站工厂（local stream）:
   a. `poll_tx_buffer`: 获取发送缓冲区
   b. `commit_tx_buffer`: 提交要发送的数据
   c. `poll_flush_tx`: 刷新发送缓冲区
   d. `poll_close_tx`: 关闭发送端（在结束时）

详细流程：

1. 调用出站工厂的 `poll_request_size` 获取大小提示。

2. 根据大小提示，调用入站工厂的 `poll_tx_buffer` 获取发送缓冲区。

3. 调用出站工厂的 `commit_rx_buffer`，将入站工厂提供的缓冲区提交给出站工厂来接收数据。

4. 调用出站工厂的 `poll_rx_buffer` 获取接收到的数据。

5. 将接收到的数据通过调用入站工厂的 `commit_tx_buffer` 提交给入站工厂发送。

6. 如果需要，调用入站工厂的 `poll_flush_tx` 来刷新发送缓冲区。

7. 当接收到 EOF 或发生错误时，调用入站工厂的 `poll_close_tx` 来关闭连接。

这个过程在 `poll_forward_oneway` 函数中实现，该函数被 `StreamForward` 的 `poll` 方法调用来处理下行流量。整个过程是一个状态机，通过 `ForwardState` 枚举来跟踪当前的处理状态。流式响应结束
