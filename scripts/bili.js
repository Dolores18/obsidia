const axios = require('axios');
//const fs = require('fs').promises;
//const path = require('path');

// 获取用户基本信息的API URL（通过逆向分析获得）
//const apiUrl = 'https://api.bilibili.com/x/relation/stat?vmid=99157282&web_location=333.999&w_rid=a6f1084a5483df7373e61cedb1ef40b9&wts=1717767224';
const apiUrl = 'https://api.bilibili.com/x/space/upstat?mid=99157282&web_location=333.999';


const getUpInfo = async () => {
        // 从 cookies.json 文件中读取 cookies
    //const cookiesPath = path.join(__dirname, 'cookies.json'); // 获取完整的文件路径
    //const cookiesData = await fs.readFile(cookiesPath, 'utf8');
    //const cookies = JSON.parse(cookiesData).cookies;
     // 构造 cookies 字符串
    const cookiesString = '_uuid=AD49CC89-867F-A10A4-AA75-854D41EA10F3173182infoc; sid=6xdajlbx; b_nut=1717730154; DedeUserID__ckMd5=56bc34a1294446ab; buvid3=BE08D264-BB8F-5C45-86F5-079A4B8438AD54780infoc; buvid4=116DBEF7-E57F-40D8-26D5-E438334335D556311-024060703-2JVVr101MESNVyKzg0rN7w%3D%3D; b_lsid=5AA55AFC_18FF0B260D2; buvid_fp=b65f671a652cf83e3cf3c0c75df7da7b; bili_jct=0b28c81f412ce969069a7e3be91f45fd; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTc5ODkzNTUsImlhdCI6MTcxNzczMDA5NSwicGx0IjotMX0.KkiRNw0W92BFbDLdVjKibknbcwmc2V3eej85xrnEZds; bili_ticket_expires=1717989295; DedeUserID=163778209; SESSDATA=c0ab91ba%2C1733282173%2Cfd753%2A62CjDPtlBBd3a5tfdt5-raZhkdq-J0NdFW_9Ctd7Od7a80LAeTwI2lLMOsbrtaDFbekPYSVlUyTHBWY0VJM0ZUcmZydWE1Q1doMnVHdnA1aXktWTVDT0psUzFRZFhyNE9oVzBjSWRJODdVbHJBY015dGZFTXdDU0ZNS0VSUzFFd3hWdTBTQWY2RFVnIIEC';
    //console.log(cookiesString)
       
    try {
        // 发起GET请求获取用户信息API
        const apiResponse = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
                'Referer': 'https://space.bilibili.com/99157282',
                'Origin': 'https://space.bilibili.com',
                'Cookie': cookiesString // 将 cookies 添加到请求头
            }
        });

        const apiData = apiResponse.data;

        // 打印获取的用户信息
        console.log('API Response:', apiData);
    } catch (error) {
        console.error('Error fetching UP info:', error);
    }
};

getUpInfo();
