
```dataviewjs 
let weather = await requestUrl('https://m.tianqi.com/guangzhou')

let res = weather.text

res = res.replace(/\s/g,'')


m= /<dlclass="temp">[\s\S]*?<\/dl>/
let dat = m.exec(res)
q = /<ddclass="txt">(\S*)/

let data = q.exec(dat)[1]

k = /[\u4e00-\u9fff]+/
d = /\d+~\d+°/
var data1 = k.exec(data)
var data2 = d.exec(data)
this.data1 = data1;
dv.paragraph(data1)
dv.paragraph(data2)
```
dv.data1