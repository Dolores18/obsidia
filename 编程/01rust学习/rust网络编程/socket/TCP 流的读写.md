以下是一个简单的例子，展示了如何使用 `TcpStream` 读写数据：

```rust
use std::io::{Read, Write};
use std::net::TcpStream;

fn main() -> std::io::Result<()> {
    let mut stream = TcpStream::connect("example.com:80")?;

    // 写入数据
    stream.write(b"GET / HTTP/1.0\r\n\r\n")?;

    // 读取数据
    let mut buffer = [0; 1024];
    let n = stream.read(&mut buffer)?;

    println!("Read {} bytes: {:?}", n, &buffer[..n]);

    Ok(())
}
```
