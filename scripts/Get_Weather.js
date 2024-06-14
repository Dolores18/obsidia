/*
 * @Author          : 稻米鼠
 * @Date            : 2022-11-22 13:18:46
 * @LastEditTime    : 2022-11-26 08:48:27
 * @FilePath        : \ob-templates\Templater-Scripts\Get_Weather.js
 * @Description     : 获取天气
 * @HomePage        : https://github.com/dmscode/Obsidian-Templates
 */
async function get_weather (city='beijing', format="天气：%c %C 气温：%t") {
  const response = await fetch("https://wttr.in/"+city+"?Tm2&lang=zh-cn&format="+format)
  const data = (await response.text()).substring(3).replace("+", "").replace(' 气温：','，').replace(" ", '')
  return data
}
module.exports = get_weather;