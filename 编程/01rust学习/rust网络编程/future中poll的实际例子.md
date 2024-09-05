```rust
pub trait Stream: Send {
    // Read
    fn poll_request_size(&mut self, cx: &mut Context<'_>) -> Poll<FlowResult<SizeHint>>;
    fn commit_rx_buffer(&mut self, buffer: Buffer) -> Result<(), (Buffer, FlowError)>;
    fn poll_rx_buffer(&mut self, cx: &mut Context<'_>)
        -> Poll<Result<Buffer, (Buffer, FlowError)>>;

    // Write
    fn poll_tx_buffer(
        &mut self,
        cx: &mut Context<'_>,
        size: NonZeroUsize,
    ) -> Poll<FlowResult<Buffer>>;
    fn commit_tx_buffer(&mut self, buffer: Buffer) -> FlowResult<()>;
    fn poll_flush_tx(&mut self, cx: &mut Context<'_>) -> Poll<FlowResult<()>>;

    fn poll_close_tx(&mut self, cx: &mut Context<'_>) -> Poll<FlowResult<()>>;
}

#[macro_export]
macro_rules! get_request_size_boxed {
    ($s: expr) => {
        ::futures::future::poll_fn(|cx| $s.poll_request_size(cx)).await
    };
}

#[macro_export]
macro_rules! get_rx_buffer_boxed {
    ($s: expr) => {
        ::futures::future::poll_fn(|cx| $s.poll_rx_buffer(cx)).await
    };
}

#[macro_export]
macro_rules! get_tx_buffer_boxed {
    ($s: expr, $size: expr) => {
        ::futures::future::poll_fn(|cx| $s.poll_tx_buffer(cx, $size)).await
    };
}

#[macro_export]
macro_rules! close_tx_boxed {
    ($s: expr) => {
        ::futures::future::poll_fn(|cx| $s.poll_close_tx(cx)).await
    };
}

pub trait StreamHandler: Send + Sync {
    fn on_stream(&self, lower: Box<dyn Stream>, initial_data: Buffer, context: Box<FlowContext>);
}

#[async_trait]
pub trait StreamOutboundFactory: Send + Sync {
    async fn create_outbound<'s, 'a, 'b>(
        &'s self,
        context: &'a mut FlowContext,
        initial_data: &'b [u8],
    ) -> FlowResult<(Box<dyn Stream>, Buffer)>;
}


```
您说得很对。我理解您的观点了，感谢您的解释。您完全正确，这些方法确实是为了支持异步操作而设计 的，使用 `Poll` 返回类型来实现非阻塞的操作。

让我们详细分析一下 `poll_request_size` 方法：

1. 这个方法确实是已经实现的，它是 `Stream` trait 的一部分。

2. 它返回一个 `Poll<FlowResult<SizeHint>>`，这意味着它可能立即返回一个结果，也可能返回 `Poll::Pending`。

3. 您说得对，它不需要额外的参数（除了 `&mut self` 和 `cx: &mut Context<'_>`）。实现这个方法的结构体可以根据自己的内部状态来决定是否可以提供一个 `SizeHint`。

4. 正如您所说，这个方法的目的是为了支持异步操作。调用者可以反复调用这个方法，直到得到一个非 `Pending` 的结果。

5. 您提到的 `self.len()` 是一个很好的例子。实现这个方法的结构体可能会检查内部缓冲区的长度，如果有足够的数据就返回一个 `SizeHint`，否则返回 `Poll::Pending`。

总的来说，这种设计允许非阻塞的操作，使得整个系统可以高效地处理多个并发的流。您的理解是正确的 ，这些方法主要是为了支持异步操作和轮询机制。

感谢您的耐心解释，这确实帮助澄清了这个设计的目的和工作方式

只是为了poll
比如输入一个buffer参数， 可能等一会就会有大小了，有数据了， 所以根本就不需要别的参数。只要self.len()
