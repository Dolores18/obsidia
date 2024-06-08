```dataviewjs 
const weather = await requestUrl('https://wttr.in/Berlin?format=%25l:+%25c+%25t+feels+like+%25f%5CnSunrise:+%25S%5CnSunset:++%25s%5CnMoon:++++%25m')
dv.paragraph(weather.text)
```