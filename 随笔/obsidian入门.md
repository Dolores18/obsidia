---
date created: 星期一, 6月 3日 2024, 7:48:04 晚上
date modified: 星期三, 6月 5日 2024, 3:14:24 凌晨
---
---
date created: 星期二, 6月 4日 2024, 10:29:20 晚上
date modified: 星期二, 6月 4日 2024, 10:29:33 晚上
---

# dataview学习

```dataviewjs
let ftMd = dv.pages("").file.sort(t => t.cday)[0]
let total = parseInt([new Date() - ftMd.ctime] / (60*60*24*1000))
let totalDays = "您已使用 ***Obsidian*** "+total+" 天，"
let nofold = '!"misc/templates"'
let allFile = dv.pages(nofold).file
let totalMd = "共创建 "+ allFile.length+" 篇笔记"
let totalTag = allFile.etags.distinct().length+" 个标签"
let totalTask = allFile.tasks.length+"个待办。 "
dv.paragraph(
	totalDays + totalMd + "、" + totalTag + "、" + totalTask
)
```


```dataview
LIST 
```

```dataview
TASK 
```
```dataview
CALENDAR file.ctime 
```
```dataviewjs
dv.paragraph(dv.pages("#学习"))
```
```dataviewjs
const nldates = app.plugins.getPlugin("nldates-obsidian")

```
