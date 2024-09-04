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
上面的只能读取一次大小的的缓存数据，需要使用循环或者是red_to_end, 而read_to_end需要一个Vec
```rust
use std::io::{Read, Write};
use std::net::TcpStream;

fn main() -> std::io::Result<()> {
    let mut stream = TcpStream::connect("example.com:80")?;

    // 写入数据
    stream.write(b"GET / HTTP/1.0\r\n\r\n")?;

    // 读取所有数据
    let mut response = Vec::new();
    stream.read_to_end(&mut response)?;

    println!("Read {} bytes", response.len());
    println!("Response: {}", String::from_utf8_lossy(&response));

    Ok(())
}
```

这个版本使用 `read_to_end` 方法，它会持续读取直到遇到 EOF（连接关闭）。这样可以确保读取所有数据。

如果您想要更细粒度的控制，可以使用循环：

```rust
let mut buffer = [0; 1024];
loop {
    match stream.read(&mut buffer) {
        Ok(0) => break, // 读取结束
        Ok(n) => {
            println!("Read {} bytes", n);
            // 处理读取的数据
        },
        Err(e) => {
            eprintln!("Error: {}", e);
            break;
        }
    }
}
``
