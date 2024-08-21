---
创建时间: 星期三, 8月 21日 2024, 7:49 早上
最近修改: 
---

```rust
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::signal;
use std::error::Error;
use std::env;
use std::sync::Arc;
use tokio::sync::Notify;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Usage: {} <server|client> [<address>]", args[0]);
        return Ok(());
    }

    match args[1].as_str() {
        "server" => run_server().await?,
        "client" => {
            if args.len() < 3 {
                println!("Client mode requires an address. Usage: {} client <address>", args[0]);
                return Ok(());
            }
            run_client(&args[2]).await?
        },
        _ => println!("Invalid mode. Use 'server' or 'client'."),
    }

    Ok(())
}

async fn run_server() -> Result<(), Box<dyn Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    println!("Server listening on 127.0.0.1:8080");

    let shutdown = Arc::new(Notify::new());
    let shutdown_clone = shutdown.clone();

    tokio::spawn(async move {
        signal::ctrl_c().await.expect("Failed to listen for ctrl+c");
        shutdown_clone.notify_one();
    });

    loop {
        tokio::select! {
            result = listener.accept() => {
                let (socket, _) = result?;
                tokio::spawn(async move {
                    handle_connection(socket).await
                });
            }
            _ = shutdown.notified() => {
                println!("Shutting down server");
                break;
            }
        }
    }

    Ok(())
}

async fn run_client(address: &str) -> Result<(), Box<dyn Error>> {
    let mut stream = TcpStream::connect(address).await?;
    println!("Connected to {}. Type 'quit' to exit.", address);

    loop {
        let mut input = String::new();
        std::io::stdin().read_line(&mut input)?;
        
        if input.trim() == "quit" {
            println!("Exiting...");
            break;
        }

        stream.write_all(input.trim().as_bytes()).await?;
        
        let mut buffer = [0; 1024];
        let n = stream.read(&mut buffer).await?;
        if n == 0 {
            println!("Server closed the connection");
            break;
        }
        println!("Received: {}", String::from_utf8_lossy(&buffer[..n]));
    }

    Ok(())
}

async fn handle_connection(mut socket: TcpStream) {
    let mut buffer = [0; 1024];

    loop {
        match socket.read(&mut buffer).await {
            Ok(0) => {
                println!("Client disconnected");
                return;
            },
            Ok(n) => {
                if let Err(e) = socket.write_all(&buffer[..n]).await {
                    eprintln!("Failed to write to socket: {}", e);
                    return;
                }
            },
            Err(e) => {
                eprintln!("Failed to read from socket: {}", e);
                return;
            }
        }
    }
}




