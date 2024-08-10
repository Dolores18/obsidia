async function generateWeatherElements() {
    const weather = await requestUrl('https://wttr.in/Guangzhou?format=%25l:+%25c+%25t+feels+like+%25f%5CnSunrise:+%25S%5CnSunset:++%25s%5CnMoon:++++%25m');
    console.log(weather);

    const elements = [
        dv.paragraph(weather.text),
        dv.el("打开调试控制台看数据")
    ];

    return elements;
}

const weatherElements = await generateWeatherElements();
weatherElements;