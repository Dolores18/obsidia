#[derive(Debug)]
struct Person {
    name: String,
    age: u32
}

fn main() {
    let person = Person { name: String::from("Alice"), age: 30 };
    println!("{:?}", person);  // 现在可以编译并运行了
}
