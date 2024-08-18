---
创建时间: 星期三, 8月 14日 2024, 3:39 下午
最近修改: 
---

```rust

use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufReader;
use std::error::Error;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
struct ApiConfigData {
    model: String,
    url: String,
    content: String,
    token: String,
}

trait ApiConfig {
    fn new(url: String, content: String, token: String) -> Self where Self: Sized;
    fn initialize_vec(&self) -> Vec<String> {
        vec![self.get_url().to_string(), self.get_content().to_string(), self.get_token().to_string()]
    }
    fn get_url(&self) -> &str;
    fn get_content(&self) -> &str;
    fn get_token(&self) -> &str;
    fn get_model(&self) -> &str;
    fn get_active_connections(&self) -> u32;
    fn increment_connections(&mut self);
    fn decrement_connections(&mut self);
}

#[derive(Debug, Serialize, Deserialize)]
struct GenericApiConfig {
    model: String,
    url: String,
    content: String,
    token: String,
    active_connections: u32,
}

impl ApiConfig for GenericApiConfig {
    fn new(url: String, content: String, token: String) -> Self {
        GenericApiConfig { model: String::new(), url, content, token, active_connections: 0 }
    }
    fn get_url(&self) -> &str { &self.url }
    fn get_content(&self) -> &str { &self.content }
    fn get_token(&self) -> &str { &self.token }
    fn get_model(&self) -> &str { &self.model }
    fn get_active_connections(&self) -> u32 { self.active_connections }
    fn increment_connections(&mut self) { self.active_connections += 1; }
    fn decrement_connections(&mut self) { if self.active_connections > 0 { self.active_connections -= 1; } }
}

struct ApiManager {
    configs: HashMap<String, Vec<Arc<Mutex<Box<dyn ApiConfig + Send>>>>>,
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
                active_connections: 0,
            };
            self.configs.entry(data.model).or_insert_with(Vec::new)
                .push(Arc::new(Mutex::new(Box::new(config) as Box<dyn ApiConfig + Send>)));
        }

        Ok(())
    }

    fn get_api(&self, model: &str) -> Option<Arc<Mutex<Box<dyn ApiConfig + Send>>>> {
        self.configs.get(model).and_then(|apis| {
            apis.iter()
                .min_by_key(|api| api.lock().unwrap().get_active_connections())
                .cloned()
        })
    }

    fn get_claude_api(&self) -> Option<Arc<Mutex<Box<dyn ApiConfig + Send>>>> {
        self.get_api("claude")
    }

    fn get_gpt_api(&self) -> Option<Arc<Mutex<Box<dyn ApiConfig + Send>>>> {
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

fn process_config(config: &Arc<Mutex<Box<dyn ApiConfig + Send>>>) {
    let mut config = config.lock().unwrap();
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


