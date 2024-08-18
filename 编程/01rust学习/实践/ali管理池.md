---
创建时间: 星期三, 8月 14日 2024, 3:10 下午
最近修改: 
---

```rust
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufReader;
use std::error::Error;
use std::collections::HashMap;
use rand::seq::SliceRandom;

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
}

#[derive(Debug, Serialize, Deserialize)]
struct GenericApiConfig {
    model: String,
    url: String,
    content: String,
    token: String,
}

impl ApiConfig for GenericApiConfig {
    fn new(url: String, content: String, token: String) -> Self {
        GenericApiConfig { model: String::new(), url, content, token }
    }
    fn get_url(&self) -> &str { &self.url }
    fn get_content(&self) -> &str { &self.content }
    fn get_token(&self) -> &str { &self.token }
    fn get_model(&self) -> &str { &self.model }
}

struct ApiManager {
    configs: HashMap<String, Vec<Box<dyn ApiConfig>>>,
    round_robin_indices: HashMap<String, usize>,
}

impl ApiManager {
    fn new() -> Self {
        ApiManager {
            configs: HashMap::new(),
            round_robin_indices: HashMap::new(),
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
            };
            self.configs.entry(data.model).or_insert_with(Vec::new).push(Box::new(config));
        }

        Ok(())
    }

    fn get_api(&mut self, model: &str) -> Option<&Box<dyn ApiConfig>> {
        self.configs.get(model).and_then(|apis| {
            if apis.is_empty() {
                None
            } else {
                let index = self.round_robin_indices.entry(model.to_string()).or_insert(0);
                let api = &apis[*index];
                *index = (*index + 1) % apis.len();
                Some(api)
            }
        })
    }

    fn get_random_api(&self, model: &str) -> Option<&Box<dyn ApiConfig>> {
        self.configs.get(model).and_then(|apis| apis.choose(&mut rand::thread_rng()))
    }

    fn get_claude_api(&mut self) -> Option<&Box<dyn ApiConfig>> {
        self.get_api("claude")
    }

    fn get_gpt_api(&mut self) -> Option<&Box<dyn ApiConfig>> {
        self.get_random_api("gpt")
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut api_manager = ApiManager::new();
    api_manager.load_configs("api_configs.json")?;

    // 使用 Claude API (轮询)
    for _ in 0..3 {
        if let Some(claude_api) = api_manager.get_claude_api() {
            println!("Using Claude API:");
            process_config(&**claude_api);
        }
    }

    // 使用 GPT API (随机)
    for _ in 0..3 {
        if let Some(gpt_api) = api_manager.get_gpt_api() {
            println!("Using GPT API:");
            process_config(&**gpt_api);
        }
    }

    Ok(())
}

fn process_config(config: &dyn ApiConfig) {
    println!("Model: {}", config.get_model());
    println!("URL: {}", config.get_url());
    println!("Content: {}", config.get_content());
    println!("Token: {}", config.get_token());
    println!("Initialized Vec: {:?}", config.initialize_vec());
    println!();
}
