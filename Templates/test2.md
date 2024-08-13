```dataviewjs 
let url = 'https://www.tianqi.com/beijing'
let res = await request({url: url,method: "GET"});
res = res.replace(/\s/g,'')
r=/<ddclass="weather">[\s\S]*?<\/dd>/g
let data = r.exec(res)[0]
r = /<span><b>(.*?)<\/b>(.*?)<\/span>/g
data = r.exec(data)
let weather='北京'+data[2]+data[1]
dv.paragraph(weather)
```
squery is already being processed

