
```dataviewjs 
let weather = await requestUrl('https://m.tianqi.com/beijing')

let res = weather.text


r=/"txt"/


let data = r.exec(res)
dv.paragraph(data)
```