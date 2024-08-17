---
创建时间: 星期三, 8月 14日 2024, 5:14 下午
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
use std::sync::RwLock;
use tokio::sync::Semaphore;
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
struct ApiConfigData {
    model: String,
    url: String,
    content: String,
    token: String,
    max_connections: usize,
}

#[derive(Clone)]
pub struct ApiPool {
    apis: Arc<RwLock<HashMap<String, Arc<dyn ApiConfig>>>>,
}

pub trait ApiConfig: Send + Sync {
    fn get_url(&self) -> &str;
    fn get_content(&self) -> &str;
    fn get_token(&self) -> &str;
    fn get_model(&self) -> &str;
    fn get_active_connections(&self) -> u32;
    fn increment_connections(&self);
    fn decrement_connections(&self);
    fn get_user_config(&self, key: &str) -> Option<Value>;
    fn set_user_config(&self, key: &str, value: Value);
    fn acquire_connection(&self) -> tokio::sync::SemaphorePermit;
}

#[derive(Debug)]
struct GenericApiConfig {
    model: String,
    url: String,
    content: String,
    token: String,
    active_connections: AtomicU32,
    user_config: RwLock<HashMap<String, Value>>,
    semaphore: Arc<Semaphore>,
}

impl ApiConfig for GenericApiConfig {
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
    fn get_user_config(&self, key: &str) -> Option<Value> {
        let user_config = self.user_config.read().unwrap();
        user_config.get(key).cloned()
    }
    fn set_user_config(&self, key: &str, value: Value) {
        let mut user_config = self.user_config.write().unwrap();
        user_config.insert(key.to_string(), value);
    }
    fn acquire_connection(&self) -> tokio::sync::SemaphorePermit {
        self.semaphore.try_acquire().expect("Failed to acquire semaphore")
    }
}

impl ApiPool {
    pub fn new() -> Self {
        Self {
            apis: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn add_api(&self, key: String, config: Arc<dyn ApiConfig>) {
        let mut apis = self.apis.write().unwrap();
        apis.insert(key, config);
    }

    pub fn get_api(&self, key: &str) -> Option<Arc<dyn ApiConfig>> {
        let apis = self.apis.read().unwrap();
        apis.get(key).cloned()
    }

    pub fn remove_api(&self, key: &str) -> Option<Arc<dyn ApiConfig>> {
        let mut apis = self.apis.write().unwrap();
        apis.remove(key)
    }

    pub fn load_configs(&self, file_path: &str) -> Result<(), Box<dyn Error>> {
        let file = File::open(file_path)?;
        let reader = BufReader::new(file);
        let config_data: Vec<ApiConfigData> = serde_json::from_reader(reader)?;

        for data in config_data {
            let config = Arc::new(GenericApiConfig {
                model: data.model.clone(),
                url: data.url,
                content: data.content,
                token: data.token,
                active_connections: AtomicU32::new(0),
                user_config: RwLock::new(HashMap::new()),
                semaphore: Arc::new(Semaphore::new(data.max_connections)),
            });
            self.add_api(data.model, config);
        }

        Ok(())
    }

    pub fn get_least_loaded_api(&self, model: &str) -> Option<Arc<dyn ApiConfig>> {
        let apis = self.apis.read().unwrap();
        apis.get(model)
            .and_then(|api| Some(api.clone()))
            .or_else(|| {
                apis.values()
                    .filter(|api| api.get_model() == model)
                    .min_by_key(|api| api.get_active_connections())
                    .cloned()
            })
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let api_pool = ApiPool::new();
    api_pool.load_configs("api_configs.json")?;

    // 使用 Claude API
    for _ in 0..5 {
        if let Some(claude_api) = api_pool.get_least_loaded_api("claude") {
            println!("Using Claude API:");
            process_config(&claude_api).await;
        }
    }

    // 使用 GPT API
    for _ in 0..5 {
        if let Some(gpt_api) = api_pool.get_least_loaded_api("gpt") {
            println!("Using GPT API:");
            process_config(&gpt_api).await;
        }
    }

    Ok(())
}

async fn process_config(config: &Arc<dyn ApiConfig>) {
    let _permit = config.acquire_connection();
    config.increment_connections();
    println!("Model: {}", config.get_model());
    println!("URL: {}", config.get_url());
    println!("Content: {}", config.get_content());
    println!("Token: {}", config.get_token());
    println!("Active Connections: {}", config.get_active_connections());
    
    // 示例：设置和获取用户配置
    config.set_user_config("max_tokens", serde_json::json!(1000));
    if let Some(max_tokens) = config.get_user_config("max_tokens") {
        println!("Max Tokens: {}", max_tokens);
    }
    
    println!();
    config.decrement_connections(); // 模拟请求结束
}


