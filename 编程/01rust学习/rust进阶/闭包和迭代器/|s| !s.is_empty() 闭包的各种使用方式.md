1. 在 `filter` 方法中使用：

```rust
let strings = vec!["", "hello", "", "world"];
let non_empty: Vec<_> = strings.into_iter().filter(|s| !s.is_empty()).collect();
println!("{:?}", non_empty); // 输出: ["hello", "world"]
```

2. 在 `any` 方法中使用：

```rust
let strings = vec!["", "hello", "", "world"];
let has_non_empty = strings.iter().any(|s| !s.is_empty());
println!("Contains non-empty strings: {}", has_non_empty); // 输出: true
```

3. 作为独立的函数使用：

```rust
let closure = |s: &str| !s.is_empty();
println!("Is 'hello' non-empty? {}", closure("hello")); // 输出: true
println!("Is '' non-empty? {}", closure("")); // 输出: false
```

4. 在 `retain` 方法中使用：

```rust
let mut strings = vec!["", "hello", "", "world"];
strings.retain(|s| !s.is_empty());
println!("{:?}", strings); // 输出: ["hello", "world"]
```

5. 在 `all` 方法中使用：

```rust
let strings = vec!["hello", "world", "rust"];
let all_non_empty = strings.iter().all(|s| !s.is_empty());
println!("All strings are non-empty: {}", all_non_empty); // 输出: true
```

这些例子展示了如何在不同的上下文中使用这个闭包。闭包的强大之处在于它可以捕获环境中的变量，使 得函数式编程风格在 Rust 中非常自然和高效。
