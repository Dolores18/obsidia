<%*

const key = 'ebe98fb0df3ee591a6c13a84857b4cc5' 

/**
 * @description 坐标查询
 */
const getIpAddress = () =>
  fetch(`https://restapi.amap.com/v3/ip?&output=json&key=${key}`).then((response) =>
    response.json()
  )

  /**
   * @description 天气查询
   * @param adcode 城市编码
   */
const getWeather = (adcode) =>
  fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?extensions=all&city=${adcode}&key=${key}`
  ).then((response) => response.json())

/**
 * @description 加载
 * @returns location 省-市
 * @returns weathers 早晚天气
 * @returns temperatures 早晚温度
 */
const loadingData = async () => {
  //Ip
  const addressInfo = await getIpAddress()
  let { province, city, adcode } = addressInfo
  const location = `${province}-${city}`
  //天气
  const weatherInfo = await getWeather(adcode)
  const { casts } = weatherInfo.forecasts[0] //解构未来4天天气预报
  const weathers = `🌅${casts[0].dayweather}/🌃${casts[0].nightweather}`
  const temperatures = `🌅${casts[0].daytemp}/🌃${casts[0].nighttemp}`
  return { location, weathers, temperatures }
}

const { location, weathers, temperatures } = await loadingData()

-%>
---
🌻日期🌻: <% tp.file.creation_date("YYYY MM DD HH:mm:ss") %>
🌙星期🌙: <% tp.file.creation_date("dddd") %>
⌚️时间⌚️: <% tp.file.creation_date("HH:mm:ss") %>
🌍位置🌍: <% location %>
☁️天气☁️: <% weathers %>
🌡️温度🌡️: <% temperatures %>
---