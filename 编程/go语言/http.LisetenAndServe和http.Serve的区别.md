1. 使用`http.ListtenAndServe
```
err := http.ListenAndServe(":8080", nil)
if err != nil {
    log.Fatal("ListenAndServe: ", err)
}

```

2. 使用`http.Server`
```
server := http.Server{
    Addr:    ":8080",
    Handler: nil,
}

```