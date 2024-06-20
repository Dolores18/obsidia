项目/goclass/test P-8
上传文件
multipart/form-data最常见的应用场景就是上传文件（例子）
首先调用parsemultipartform方法
从file字段获得fileheader，调用其open方法来获得文件
可以使用iO.ReadAll函数把文件内容读取到byte里。

上传文件还有一个简单的方法：FormFile例子
无需调用parsemultipartform方法，
返回指定key对应的第一个value，如果只是上传一个文件，这个方法要快些。


Post请求，json body
不是所有的post请求都来自from
客户端框架例如angular会议不同的方式对post请求编码。