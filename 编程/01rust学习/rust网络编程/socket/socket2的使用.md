Rust 中的 socket2 crate 提供了对底层网络套接字的更底层和灵活的控制。以下是 socket2 的一些常见用法：

1. 创建套接字

```rust
use socket2::{Socket, Domain, Type};

let socket = Socket::new(Domain::IPV4, Type::STREAM, None)?;
```

2. 绑定地址

```rust
use std::net::SocketAddr;

let addr: SocketAddr = "127.0.0.1:8080".parse()?;
socket.bind(&addr.into())?;
```

3. 监听连接

```rust
socket.listen(128)?;
```

4. 接受连接

```rust
let (client_socket, client_addr) = socket.accept()?;
```

5. 连接到服务器

```rust
let server_addr: SocketAddr = "example.com:80".parse()?;
socket.connect(&server_addr.into())?;
```

6. 发送数据

```rust
let data = b"Hello, World!";
socket.send(data)?;
```

7. 接收数据

```rust
let mut buf = [0; 1024];
let bytes_read = socket.recv(&mut buf)?;
```

8. 设置套接字选项

```rust
use socket2::SockRef;

let sock_ref = SockRef::from(&socket);
sock_ref.set_reuse_address(true)?;
sock_ref.set_nonblocking(true)?;
```

9. 获取套接字信息

```rust
let local_addr = socket.local_addr()?;
let peer_addr = socket.peer_addr()?;
```

10. 使用 UDP

```rust
let udp_socket = Socket::new(Domain::IPV4, Type::DGRAM, None)?;
udp_socket.bind(&"0.0.0.0:0".parse::<SocketAddr>()?.into())?;

let data = b"Hello, UDP!";
let target_addr: SocketAddr = "127.0.0.1:8888".parse()?;
udp_socket.send_to(data, &target_addr.into())?;
```

11. 多播

```rust
use socket2::Protocol;

let multicast_socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
multicast_socket.join_multicast_v4(&Ipv4Addr::new(239, 0, 0, 1), &Ipv4Addr::UNSPECIFIED)?;
```

12. 设置 TTL (生存时间)

```rust
socket.set_ttl(64)?;
```

13. 获取和设置缓冲区大小

```rust
let recv_buffer_size = socket.recv_buffer_size()?;
socket.set_send_buffer_size(65536)?;
```
