#  查询昨天创建和修改的文件
```dataviewjs

dv.list(
  dv.pages()
    .filter(n => 
      n.file.mtime >= dv.date('yesterday') &&
      n.file.mtime < dv.date('today'))
    .file.link
)
```

# 查询一定时间的文件
```dataviewjs
dv.list(
  dv.pages()
    .where(n => 
	    n.file.mtime >= dv.date('now') - dv.duration('36h') &&
	    n.file.mtime <= dv.date('now') - dv.duration('12h'))
    .file.link
)

```