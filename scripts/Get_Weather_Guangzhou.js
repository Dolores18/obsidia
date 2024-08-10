/*
 * @Author          : Claude
 * @Date            : 2023-05-24 10:30:00
 * @LastEditTime    : 2023-05-24 10:30:00
 * @FilePath        : \ob-templates\Templater-Scripts\Get_Weather_Guangzhou.js
 * @Description     : 获取广州天气
 */
async function get_weather_guangzhou(format = "%l: %c %t feels like %f\nSunrise: %S\nSunset:  %s\nMoon:    %m") {
  const response = await fetch("https://wttr.in/Guangzhou?format=" + encodeURIComponent(format));
  const data = await response.text();
  console.log(data);
  return data;
}
module.exports = get_weather_guangzhou;