---
创建时间: 星期一, 8月 19日 2024, 5:33 凌晨
最近修改: 
---


```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

// 模拟异步烧水操作
struct BoilWater {
    start_time: Instant,
}

impl Future for BoilWater {
    type Output = ();

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        let elapsed = self.start_time.elapsed();
        if elapsed >= Duration::from_secs(5) {
            println!("水烧开了！");
            Poll::Ready(())
        } else {
            // 如果水还没烧开，安排一个唤醒
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}

// 模拟切菜
fn chop_vegetables() {
    println!("正在切菜...");
    // 假设切菜需要 2 秒
    std::thread::sleep(Duration::from_secs(2));
    println!("菜切好了！");
}

// 模拟炒菜
fn stir_fry() {
    println!("开始炒菜...");
    // 假设炒菜需要 3 秒
    std::thread::sleep(Duration::from_secs(3));
    println!("菜炒好了！");
}

// 主要的烹饪过程
async fn cook() {
    // 开始烧水
    let boil_water = BoilWater { start_time: Instant::now() };
    
    // 同时开始切菜
    chop_vegetables();
    
    // 等待水烧开
    boil_water.await;
    
    // 水烧开后开始炒菜
    stir_fry();
}

fn main() {
    // 在实际应用中，你会使用一个异步运行时如 tokio 来执行这个 Future
    // 这里我们使用一个简化的方式来演示
    futures::executor::block_on(cook());
}



```
# Rust 异步编程：以烹饪为例

以下是一个完整的 Rust 程序，展示了使用异步编程模拟烹饪过程：

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};
use rand::Rng;
use tokio;

struct BoilWater {
    start_time: Instant,
    duration: Duration,
}

impl Future for BoilWater {
    type Output = ();

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        if self.start_time.elapsed() >= self.duration {
            println!("水烧开了！");
            Poll::Ready(())
        } else {
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}

fn start_boiling() -> BoilWater {
    let duration = Duration::from_secs(rand::thread_rng().gen_range(3..8));
    println!("开始烧水，预计需要 {:?}", duration);
    BoilWater {
        start_time: Instant::now(),
        duration,
    }
}

async fn chop_vegetables() {
    println!("开始切菜...");
    let duration = Duration::from_secs(rand::thread_rng().gen_range(1..4));
    tokio::time::sleep(duration).await;
    println!("菜切好了！用时 {:?}", duration);
}

async fn stir_fry() {
    println!("开始炒菜...");
    let duration = Duration::from_secs(rand::thread_rng().gen_range(2..5));
    tokio::time::sleep(duration).await;
    println!("菜炒好了！用时 {:?}", duration);
}

async fn cook() {
    let boil_water = start_boiling();
    
    let chop_task = tokio::spawn(chop_vegetables());
    
    tokio::select! {
        _ = boil_water => println!("水先烧开了"),
        _ = chop_task => println!("菜先切好了"),
    }
    
    let _ = boil_water.await;
    let _ = chop_task.await;
    
    stir_fry().await;
}

#[tokio::main]
async fn main() {
    cook().await;
}
