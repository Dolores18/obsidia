---
创建时间: 星期三, 8月 14日 2024, 5:48 下午
最近修改: 
---
```rust
use axum::{
    routing::post,
    http::StatusCode,
    Json, Router,
    extract::State,
};
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
use reqwest::Client;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[derive(Debug, Serialize, Deserialize)]
struct ApiConfigData {
    model: String,
    url: String,
    token: String,
    max_connections: usize,
}

#[derive(Clone)]
pub struct ApiPool {
    apis: Arc<RwLock<HashMap<String, Arc<dyn ApiConfig>>>>,
}

pub trait ApiConfig: Send + Sync {
    fn get_url(&self) -> &str;
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
    token: String,
    active_connections: AtomicU32,
    user_config: RwLock<HashMap<String, Value>>,
    semaphore: Arc<Semaphore>,
}

impl ApiConfig for GenericApiConfig {
    fn get_url(&self) -> &str { &self.url }
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

#[derive(Debug, Deserialize)]
struct UserRequest {
    model: String,
    user_config: HashMap<String, Value>,
}

async fn handle_request(
    State(api_pool): State<Arc<ApiPool>>,
    Json(user_request): Json<UserRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    if let Some(api) = api_pool.get_least_loaded_api(&user_request.model) {
        let _permit = api.acquire_connection();
        api.increment_connections();

        // Set user config
        for (key, value) in user_request.user_config.iter() {
            api.set_user_config(key, value.clone());
        }

        // Call the API
        let response = call_api(api.clone(), &user_request.user_config).await;

        api.decrement_connections();

        match response {
            Ok(body) => Ok(Json(body)),
            Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        }
    } else {
        Err((StatusCode::NOT_FOUND, "API not found".to_string()))
    }
}

async fn call_api(api: Arc<dyn ApiConfig>, user_config: &HashMap<String, Value>) -> Result<Value, Box<dyn Error>> {
    let client = Client::new();

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api.get_token()))?);

    let mut body = serde_json::Map::new();
    body.insert("model".to_string(), Value::String(api.get_model().to_string()));
    for (key, value) in user_config {
        body.insert(key.clone(), value.clone());
    }

    let response = client.post(api.get_url())
        .headers(headers)
        .json(&body)
        .send()
        .await?;

    let response_body = response.json::<Value>().await?;
    Ok(response_body)
}

#[tokio::main]
async fn main() {
    let api_pool = Arc::new(ApiPool::new());
    api_pool.load_configs("api_configs.json").expect("Failed to load API configs");

    let app = Router::new()
        .route("/api", post(handle_request))
        .with_state(api_pool);

    println!("Server started at http://localhost:8080");
    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}






