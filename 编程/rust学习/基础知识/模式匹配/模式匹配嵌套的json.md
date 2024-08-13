---
创建时间: 星期二, 8月 13日 2024, 3:30 下午
最近修改: 
---
1.链式调用
```rust
use serde_json::Value;

let json_str = r#"
{
    "user": {
        "profile": {
            "age": 30
        }
    }
}
"#;

let json: Value = serde_json::from_str(json_str).unwrap();

match json.get("user").and_then(|user| user.get("profile")).and_then(|profile| profile.get("age")) {
    Some(age) => println!("User age: {}", age),
    None => println!("Age not found or invalid JSON structure"),
}

另外一种写法取出age
let result = json.get("user")
    .and_then(|user| user.get("profile"))
    .and_then(|profile| profile.get("age"))
    .ok_or("Age not found or invalid JSON structure");

match result {
    Ok(age) => println!("User age: {}", age),
    Err(e) => println!("{}", e),
}

如果是字符串

let json: Value = serde_json::from_str(json_str).unwrap();

let age: Option<String> = json.get("user")
    .and_then(|user| user.get("profile"))
    .and_then(|profile| profile.get("age"))
    .and_then(|age| age.as_str())
    .map(|s| s.to_string());

// 现在 age 是 Option<String> 类型

看是否相等
let comparison_age = 25; // 假设我们现在比较的是数字

let result = json.get("user")
    .and_then(|user| user.get("profile"))
    .and_then(|profile| profile.get("age"))
    .and_then(|age| age.as_i64().or_else(|| age.as_str().and_then(|s| s.parse::<i64>().ok())))
    .map(|n| (n, n == comparison_age));

match result {
    Some((age, true)) => println!("Age {} is equal to comparison age", age),
    Some((age, false)) => println!("Age {} is not equal to comparison age", age),
    None => println!("Age not found or not a valid number"),
}

3.返回user，封装在get_user
let comparison_age = 25; // 假设我们现在比较的是数字

let result = json.get("user").and_then(|user| {
    user.get("profile")
        .and_then(|profile| profile.get("age"))
        .and_then(|age| age.as_i64().or_else(|| age.as_str().and_then(|s| s.parse::<i64>().ok())))
        .map(|n| (user, n == comparison_age))
});

match result {
    Some((user, true)) => {
        println!("Age is equal to comparison age. Returning user:");
        println!("{}", serde_json::to_string_pretty(user).unwrap());
        Some(user)
    },
    Some((_, false)) => {
        println!("Age is not equal to comparison age");
        None
    },
    None => {
        println!("Age not found or not a valid number");
        None
    },
}

4.使用if let

use serde_json::Value;

fn main() {
    let json_str = r#"
    {
        "user": {
            "profile": {
                "age": 25
            }
        }
    }
    "#;

    let json: Value = serde_json::from_str(json_str).unwrap();
    let comparison_age = 25;

    let user = json.get("user")
        .and_then(|user| {
            user.get("profile")
                .and_then(|profile| profile.get("age"))
                .and_then(|age| age.as_i64().or_else(|| age.as_str().and_then(|s| s.parse::<i64>().ok())))
                .and_then(|n| if n == comparison_age { Some(user) } else { None })
        });

    if let Some(user) = user {
        println!("Age is equal to comparison age. Returning user:");
        println!("{}", serde_json::to_string_pretty(user).unwrap());
    } else {
        println!("Age not found, not a valid number, or not equal to comparison age");
    }
}





```





2.使用嵌套的match

```rust
match json.get("user") {
    Some(user) => match user.get("profile") {
        Some(profile) => match profile.get("age") {
            Some(age) => println!("User age: {}", age),
            None => println!("Age not found"),
        },
        None => println!("Profile not found"),
    },
    None => println!("User not found"),
}

4.使用if let

use serde_json::Value;

fn main() {
    let json_str = r#"
    {
        "user": {
            "profile": {
                "age": 25
            }
        }
    }
    "#;

    let json: Value = serde_json::from_str(json_str).unwrap();
    let comparison_age = 25;

    let user = json.get("user")
        .and_then(|user| {
            user.get("profile")
                .and_then(|profile| profile.get("age"))
                .and_then(|age| age.as_i64().or_else(|| age.as_str().and_then(|s| s.parse::<i64>().ok())))
                .and_then(|n| if n == comparison_age { Some(user) } else { None })
        });

    if let Some(user) = user {
        println!("Age is equal to comparison age. Returning user:");
        println!("{}", serde_json::to_string_pretty(user).unwrap());
    } else {
        println!("Age not found, not a valid number, or not equal to comparison age");
    }
}




````
3.使用if let
```rust
if let Some(user) = json.get("user") {
    if let Some(profile) = user.get("profile") {
        if let Some(age) = profile.get("age") {
            println!("User age: {}", age);
        } else {
            println!("Age not found");
        }
    } else {
        println!("Profile not found");
    }
} else {

println!("User not found");
}
```
4.使用?运算符
```rust
fn get_user_age(json: &Value) -> Result<i64, &'static str> {
    let age = json.get("user")
        .ok_or("User not found")?
        .get("profile")
        .ok_or("Profile not found")?
        .get("age")
        .ok_or("Age not found")?
        .as_i64()
        .ok_or("Age is not a valid integer")?;
    
    Ok(age)
}




match get_user_age(&json) {
    Ok(age) => println!("User age: {}", age),
    Err(e) => println!("Error: {}", e),
}

