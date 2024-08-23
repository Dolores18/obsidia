在 Rust 中，当你在函数或方法的参数中使用 trait 时，这确实意味着你期望传入一个实现了该 trait  的类型的值。这种做法称为 "trait bounds"（trait 约束）。

具体来说：

1. 必须实现指定的 trait：
   传入的参数必须是一个实现了指定 trait 的类型的实例。

2. 多态性：
   这允许函数接受不同的类型，只要它们实现了指定的 trait。

3. 静态分发：
   默认情况下，Rust 使用静态分发，这意味着编译器会为每个具体类型生成专门的函数版本。

4. 动态分发：
   如果使用 `dyn Trait`，则会使用动态分发，这会有一些运行时开销，但允许更灵活的代码。

示例：

```rust
// 定义一个 trait
trait Printable {
    fn print(&self);
}

// 实现 trait 的结构体
struct Book {
    title: String,
}

impl Printable for Book {
    fn print(&self) {
        println!("Book: {}", self.title);
    }
}

// 接受实现了 Printable trait 的参数的函数
fn print_item(item: &impl Printable) {
    item.print();
}

// 或者使用泛型语法
fn print_item_generic<T: Printable>(item: &T) {
    item.print();
}

fn main() {
    let book = Book { title: String::from("Rust Programming") };

    print_item(&book);
    print_item_generic(&book);
}
```
