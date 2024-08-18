---
创建时间: 星期三, 8月 14日 2024, 4:29 下午
最近修改: 
---
```rust
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufReader;
use std::error::Error;
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};

#[derive(Debug, Serialize, Deserialize)]
struct ApiConfigData {
    model: String,
    url: String,
    content: String,
    token: String,
}

trait ApiConfig: Send + Sync {
    fn new(url: String, content: String, token: String) -> Self where Self: Sized;
    fn initialize_vec(&self) -> Vec<String> {
        vec![self.get_url().to_string(), self.get_content().to_string(), self.get_token().to_string()]
    }
    fn get_url(&self) -> &str;
    fn get_content(&self) -> &str;
    fn get_token(&self) -> &str;
    fn get_model(&self) -> &str;
    fn get_active_connections(&self) -> u32;
    fn increment_connections(&self);
    fn decrement_connections(&self);
}

#[derive(Debug)]
struct GenericApiConfig {
    model: String,
    url: String,
    content: String,
    token: String,
    active_connections: AtomicU32,
}

impl ApiConfig for GenericApiConfig {
    fn new(url: String, content: String, token: String) -> Self {
        GenericApiConfig { 
            model: String::new(), 
            url, 
            content, 
            token, 
            active_connections: AtomicU32::new(0) 
        }
    }
    fn get_url(&self) -> &str { &self.url }
    fn get_content(&self) -> &str { &self.content }
    fn get_token(&self) -> &str { &self.token }
    fn get_model(&self) -> &str { &self.model }
    fn get_active_connections(&self) -> u32 { 
        self.active_connections.load(Ordering::Relaxed) 
    }
    fn increment_connections(&self) { 
        self.active_connections.fetch_add(1, Ordering::Relaxed);
    }
    fn decrement_connections(&self) { 
        self.active_connections.fetch_sub(1, Ordering::Relaxed);
    }
}

struct ApiManager {
    configs: HashMap<String, Vec<Arc<dyn ApiConfig>>>,
}

impl ApiManager {
    fn new() -> Self {
        ApiManager {
            configs: HashMap::new(),
        }
    }

    fn load_configs(&mut self, file_path: &str) -> Result<(), Box<dyn Error>> {
        let file = File::open(file_path)?;
        let reader = BufReader::new(file);
        let config_data: Vec<ApiConfigData> = serde_json::from_reader(reader)?;

        for data in config_data {
            let config = GenericApiConfig {
                model: data.model.clone(),
                url: data.url,
                content: data.content,
                token: data.token,
                active_connections: AtomicU32::new(0),
            };
            self.configs.entry(data.model).or_insert_with(Vec::new)
                .push(Arc::new(config));
        }

        Ok(())
    }

    fn get_api(&self, model: &str) -> Option<Arc<dyn ApiConfig>> {
        self.configs.get(model).and_then(|apis| {
            apis.iter()
                .min_by_key(|api| api.get_active_connections())
                .cloned()
        })
    }

    fn get_claude_api(&self) -> Option<Arc<dyn ApiConfig>> {
        self.get_api("claude")
    }

    fn get_gpt_api(&self) -> Option<Arc<dyn ApiConfig>> {
        self.get_api("gpt")
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut api_manager = ApiManager::new();
    api_manager.load_configs("api_configs.json")?;

    // 使用 Claude API
    for _ in 0..5 {
        if let Some(claude_api) = api_manager.get_claude_api() {
            println!("Using Claude API:");
            process_config(&claude_api);
        }
    }

    // 使用 GPT API
    for _ in 0..5 {
        if let Some(gpt_api) = api_manager.get_gpt_api() {
            println!("Using GPT API:");
            process_config(&gpt_api);
        }
    }

    Ok(())
}

fn process_config(config: &Arc<dyn ApiConfig>) {
    config.increment_connections();
    println!("Model: {}", config.get_model());
    println!("URL: {}", config.get_url());
    println!("Content: {}", config.get_content());
    println!("Token: {}", config.get_token());
    println!("Active Connections: {}", config.get_active_connections());
    println!("Initialized Vec: {:?}", config.initialize_vec());
    println!();
    config.decrement_connections(); // 模拟请求结束
}

````


主要的修改包括：

使用 AtomicU32 替代普通的 u32 来存储活跃连接数。

修改 ApiConfig trait 和 GenericApiConfig 结构体，使用原子操作来管理连接数。

移除了 Mutex，直接使用 Arc<dyn ApiConfig>。

在 ApiConfig trait 中添加 Send + Sync 约束，确保可以安全地在线程间共享。

修改 increment_connections 和 decrement_connections 方法，使用原子操作。

在 get_active_connections 方法中使用原子加载操作。

这种无锁的实现方式有以下优点：

减少了锁竞争，可能提高并发性能。
简化了代码结构，不再需要显式的锁管理。
仍然保证了线程安全和避免了竞态条件。
需要注意的是，这里使用了 Ordering::Relaxed，这是最宽松的内存顺序。在这个场景中，我们不需要更强的内存顺序保证，因为我们只关心单个计数器的原子性，而不需要跨多个操作的同步。如果将来需要更复杂的同步语义，可能需要考虑使用更强的内存顺序。

这个实现应该能够有效地管理最小连接数的计数，同时避免竞态条件，而且不使用显式的锁。


