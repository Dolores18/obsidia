
```rust
use serde_json::Value;
use serde::{Deserialize, Serialize};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let json_configs = r#"
    [
        {
            "name": "AI_1",
            "response_structure": {
                "choices": [
                    {
                       "delta": {
                            "content": "Sample content"
                        }
                    }
                ]
            }
        },
        {
            "name": "AI_2",
            "response_structure": {
                "results": [
                    {
                        "message": {
                           "text": "Sample text"
                       }
                    }
                ]
            }
        }
    ]
    "#;

    // 解析 JSON 数组
    let configs: Vec<AIConfig> = serde_json::from_str(json_configs)?;

    // 模拟从不同的 AI 获取响应
    let ai_1_response = r#"
    {
        "choices": [
           {
                "delta": {
                    "content": "Hello from AI 1!"
                }
            }
        ]
    }
    "#;

    let ai_2_response = r#"
    {
        "results": [
            {
                "message": {
                    "text": "Greetings from AI 2!"
               }
            }
        ]
    }
    "#;

    // 使用配置解析响应
    for config in configs {
       match config.name.as_str() {
            "AI_1" => {
                let response: Value = serde_json::from_str(ai_1_response)?;
                if let Some(content) = response["choices"][0]["delta"]["content"].as_str() {
                    println!("AI_1 response: {}", content);
                }
            },
            "AI_2" => {
                let response: Value = serde_json::from_str(ai_2_response)?;
                if let Some(text) = response["results"][0]["message"]["text"].as_str() {
                   println!("AI_2 response: {}", text);
                }
            },
            _ => println!("Unknown AI configuration"),
        }
    }

    Ok(())
}

#[derive(Deserialize, Serialize, Debug)]
struct AIConfig {
    name: String,
    response_structure: Value,
}
```
