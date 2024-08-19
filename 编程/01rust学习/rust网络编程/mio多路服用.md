示例代码（使用 mio）：

```rust
use mio::*;
use mio::net::{TcpListener, TcpStream};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut events = Events::with_capacity(1024);
    let mut poll = Poll::new()?;

    // 设置 TCP 监听器
    let addr = "127.0.0.1:8080".parse()?;
    let mut server = TcpListener::bind(addr)?;

    // 注册服务器以接受连接
    poll.registry().register(&mut server, Token(0), Interest::READABLE)?;

    loop {
        poll.poll(&mut events, None)?;

        for event in events.iter() {
            match event.token() {
                Token(0) => {
                    // 处理新连接
                    let (mut connection, address) = server.accept()?;
                    println!("New connection: {:?}", address);

                    // 在这里可以进一步处理连接
                },
                _ => unreachable!(),
            }
        }
    }
}
```
