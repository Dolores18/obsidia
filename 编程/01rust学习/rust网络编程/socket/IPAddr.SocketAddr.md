```rust
use std::net::{TcpListener, SocketAddr};

fn main() -> std::io::Result<()> {
    let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
    let listener = TcpListener::bind(addr)?;

    println!("Listening on: {}", addr);

    for stream in listener.incoming() {
        let stream = stream?;
        println!("New connection: {}", stream.peer_addr()?);
    }

    Ok(())
}
```
