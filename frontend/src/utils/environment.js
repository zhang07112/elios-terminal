export const getTimeInfo = () => {
  const now = new Date()
  const hours = now.getHours()
  const timeOfDay = 
    hours < 6 ? '深夜' :
    hours < 9 ? '清晨' :
    hours < 12 ? '上午' :
    hours < 14 ? '中午' :
    hours < 18 ? '下午' :
    hours < 22 ? '傍晚' : '深夜'

  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  const season = 
    now.getMonth() >= 2 && now.getMonth() <= 4 ? '春季' :
    now.getMonth() >= 5 && now.getMonth() <= 7 ? '夏季' :
    now.getMonth() >= 8 && now.getMonth() <= 10 ? '秋季' : '冬季'

  return {
    time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
    weekday: weekdays[now.getDay()],
    month: months[now.getMonth()],
    year: now.getFullYear(),
    season,
    timeOfDay,
    hour: hours,
    minute: now.getMinutes()
  }
}

export const getLocationFromCoords = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=zh`
    )
    const data = await response.json()
    return {
      city: data.address.city || data.address.town || data.address.village || '未知城市',
      district: data.address.district || '',
      province: data.address.state || '',
      country: data.address.country || '中国'
    }
  } catch (error) {
    console.error('获取位置失败:', error)
    return { city: '未知城市', district: '', province: '', country: '中国' }
  }
}

export const getWeather = async (lat, lon) => {
  try {
    const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_cn`
    )
    const data = await response.json()
    
    if (data.cod === 200) {
      return {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind: Math.round(data.wind.speed * 3.6)
      }
    }
  } catch (error) {
    console.error('获取天气失败:', error)
  }
  return null
}

export const getEnvironmentContext = async () => {
  const timeInfo = getTimeInfo()
  
  let location = null
  let weather = null
  
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      })
      
      const { latitude, longitude } = position.coords
      location = await getLocationFromCoords(latitude, longitude)
      weather = await getWeather(latitude, longitude)
    } catch (error) {
      console.log('获取位置失败，使用默认位置')
      location = { city: '安阳市', district: '汤阴县', province: '河南省', country: '中国' }
    }
  } else {
    location = { city: '安阳市', district: '汤阴县', province: '河南省', country: '中国' }
  }

  return {
    time: timeInfo,
    location,
    weather,
    onlineAt: new Date().toISOString()
  }
}

export const formatEnvironmentContext = (context) => {
  if (!context) return ''

  let contextStr = `【当前环境信息】\n`
  
  if (context.time) {
    contextStr += `⏰ 时间：${context.time.date} ${context.time.weekday} ${context.time.time}\n`
    contextStr += `🌅 时段：${context.time.timeOfDay}（${context.time.season}）\n`
  }
  
  if (context.location) {
    contextStr += `📍 地点：${context.location.city}${context.location.district ? ' ' + context.location.district : ''}\n`
  }
  
  if (context.weather) {
    contextStr += `🌤️ 天气：${context.weather.description} ${context.weather.temp}°C\n`
    contextStr += `💧 湿度：${context.weather.humidity}% 💨 风速：${context.weather.wind}km/h\n`
  }
  
  return contextStr
}
