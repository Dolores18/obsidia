- **使用 `http.Handle`**：适合需要定制化和复杂逻辑的处理器，可以通过结构体实现 `http.Handler` 接口来管理状态和实现更复杂的处理逻辑。
    
- **使用 `http.HandleFunc`**：适合简单和快速注册处理函数的场景，适用于快速原型开发和简单的请求处理。
```
type MyHandler struct {
    Greeting string
    Color    string
}

func (h *MyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "<div style='color: %s;'>%s, World!</div>", h.Color, h.Greeting)
}

func main() {
    mh := &MyHandler{
        Greeting: "Hello",
        Color:    "blue", // 添加一个颜色字段
    }

    http.Handle("/hello", mh)

    // 启动 HTTP 服务器
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}

```