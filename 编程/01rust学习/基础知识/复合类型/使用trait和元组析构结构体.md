```rust
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn new(x: f64, y: f64) -> Self {
        Point { x, y }
    }
}

trait Coordinate {
    fn coordinates(&self) -> (f64, f64);
}

impl Coordinate for Point {
    fn coordinates(&self) -> (f64, f64) {
        (self.x, self.y)
    }
}

fn main() {
    // 使用new方法创建Point实例
    let point = Point::new(3.0, 4.0);
    
    // 使用方法获取坐标
    let coords = point.coordinates();
    println!("The coordinates are {:?}", coords);
    
    // 使用析构语法
    let (x, y) = point.coordinates();
    println!("x = {}, y = {}", x, y);
}
