---
date created: 星期二, 6月 4日 2024, 11:56:57 晚上
date modified: 星期三, 6月 5日 2024, 4:31:19 凌晨
tags:
  - 学习
---
# 第一部分 倒计时
```dataviewjs
const nldates = app.plugins.getPlugin("nldates-obsidian")
const today = nldates.parseDate("today").moment
const week =  nldates.parseDate("next week").moment
const month = nldates.parseDate("next month").moment
const year = nldates.parseDate("next year").moment
const weekDiff = week.diff(today,'days')
const weekPercentage = parseInt(weekDiff/7*100)
const monthDiff = month.diff(today,'days')
const daysInMonth = today.daysInMonth()
const monthPercentage = parseInt(monthDiff/daysInMonth*100)
const yearDiff = year.diff(today,'days')
const yearPercentage = parseInt(yearDiff/365*100)
dv.el('div','本周还剩<span class="stress">'+weekDiff+'</span>天')
dv.el('progress',null,{attr:{max:7,value:weekDiff,percentage:weekDiff}})
dv.el('div','本月还剩<span class="stress">'+monthDiff+'</span>天')
dv.el('progress',null,{attr:{max:daysInMonth,value:monthDiff,percentage:monthPercentage}})
dv.el('div','今年还剩<span class="stress">'+yearDiff+'</span>天')
dv.el('progress',null,{attr:{max:365,value:yearDiff,percentage:yearPercentage}})
```
距离三支一扶考试还有
`$=y=2024,m=6,d=29;Math.ceil((new Date(y, m-1, d) - new Date())/ 86400000)` 天


```dataviewjs
//计算本月有多少天,还剩多少天
let cday = dv.current().file.ctime//创建日期
const date1 = new Date(cday);//创建日期
const dateString1 = date1.toLocaleString(); // 将日期时间转换为本地时间字符串

let totalDays = cday.daysInMonth   //创建月天数
let remainingDays = totalDays- cday.day + 1 //创建月天数减创建时间 还剩多少天

//计算倒计天数
let tarday = "2024-06-29"
let targetDate = dv.date(tarday)
let timeDiff = targetDate - cday
let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))   //倒计天数


dv.el('div','创建时间'+dateString1+'');
dv.el('div','目标日期'+tarday+'');
//设置日期&weekday输出格式
const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][cday.weekday - 1]
const formattedDate = `${cday.year}-${cday.month.toString().padStart(2, '0')}-${cday.day.toString().padStart(2, '0')}  -${weekday}`
dv.el('div', ''+formattedDate+' 星期'+cday.weekday+'');


dv.el('div','创建月天数'+cday.daysInMonth+'');
dv.el('div','创建月剩多少天'+remainingDays+'');
dv.el('div','距离目标日还剩'+daysDiff+'/365天')
dv.el('progress',null,{attr:{max:365,value:daysDiff}})  //进度条2
dv.el('div',' 创建时间'+dateString1+' 距离创建月底'+remainingDays+'天')
dv.el('progress',null,{attr:{max:totalDays,value:remainingDays}} ) //进度条 1

//第一部分


dv.el('div', '第二部分今天距离年底');

//当前时间
// 获取当前日期
let today = new Date();
let currentMonth = today.getMonth(); // 获取当前月份索引
let currentYear = today.getFullYear(); // 获取当前年份

// 计算本月天数
let totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

// 计算距离月底还剩多少天
let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
let daysRemainingInMonth = Math.ceil((lastDayOfMonth - today) / (1000 * 60 * 60 * 24));

// 计算距离今天年底还有多少天
let remainingDaysFromTodayToYearEnd = Math.ceil((new Date(currentYear + 1, 0, 0) - today) / (1000 * 60 * 60 * 24));


// 创建各个信息的元素并添加到页面中
dv.el('div', '本月天数: ' + totalDaysInMonth + ' 天');
dv.el('div', '本月还剩: ' + daysRemainingInMonth + ' 天');
dv.el('progress',null,{attr:{max:totalDaysInMonth,value:daysRemainingInMonth}} ) 
dv.el('div', '距离年底还有: ' + remainingDaysFromTodayToYearEnd + ' 天');
dv.el('progress',null,{attr:{max:365,value:remainingDaysFromTodayToYearEnd}} ) 

