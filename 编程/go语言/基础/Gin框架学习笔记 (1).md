# Gin框架学习笔记

## 1. Gin框架的安装

Gin是一个非常受欢迎的Golang Web框架，在GitHub上已经有64k的星星，它和Golang的语法一样简洁明了，使得初学者得以迅速入门。

### 1.1 下载之前最好要配置代理

**直接设置GOPROXY**

```Go
GOPROXY=https://goproxy.cn,direct
```

### 1.2 下载Gin

```Go
go get -u github.com/gin-gonic/gin
go mod tidy // 这个命令会自动添加缺少的依赖并移除不再需要的依赖
```



## 2. 编写一个Hello World路由

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	// 创建一个默认的路由引擎
	router := gin.Default()

	// 绑定路由规则，执行的函数
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World!",
		})
	})

	// 绑定端口号，然后启动应用
	err := router.Run(":8080")
	if err != nil {
		fmt.Println("router run error: ", err.Error())
		return
	}

	// 第二种启动方式，router.Run() 本质上调用的是 http.ListenAndServe() 方法
	err2 := http.ListenAndServe(":8080", router)
	if err != nil {
		fmt.Println("router run error: ", err2.Error())
		return
	}
}
```



## 3. 响应数据

### 3.1 返回字符串数据

```go
router.GET("/txt", func(c *gin.Context) {
  c.String(http.StatusOK, "返回txt")
})
```

### 3.2 返回json数据

#### router:

```go
	/*
		响应json的几种方式
	*/
	// 响应json的第一种方式(常用)
	router.GET("/json_one", json_test.JsonOne)
	// 响应json的第二种方式(结构体)
	router.GET("/json_two", json_test.JsonTwo)
	// 响应json的第三种方式(map)
	router.GET("/json_three", json_test.JsonThree)
	// 响应json的第四种方式(数组)
	router.GET("/json_four", json_test.JsonFour)
	// 响应json的第五种方式(自定义,细微控制)
	router.GET("/json_five", json_test.JsonFive)
```

#### function:

```go
package json_test

import "github.com/gin-gonic/gin"

func JsonOne(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Hello World!",
	})
}

func JsonTwo(c *gin.Context) {
	type msg struct {
		Name    string
		Message string
	}
	data := msg{
		Name:    "苏风",
		Message: "Hello World!",
	}
	c.JSON(200, data)
}

func JsonThree(c *gin.Context) {
	data := map[string]interface{}{
		"name":    "苏风",
		"message": "Hello World!",
	}
	c.JSON(200, data)
}

func JsonFour(c *gin.Context) {
	// 切片
	data := []string{"苏风", "Hello World!"}
	c.JSON(200, data)
}

func JsonFive(c *gin.Context) {
	type UserInfo struct {
		UserName string `json:"user_name"` // `json:`这里的内容是为了控制返回的json字段名
		Age      int    `json:"age"`
		Password string `json:"-"` // 这里的"-"表示不返回这个字段
	}
	user := UserInfo{
		UserName: "苏风",
		Age:      18,
		Password: "123456",
	}
	c.JSON(200, user)
}
```

### 3.3 返回Xml与Yaml数据

#### router:

```go
	/*
		响应xml与yaml
	*/
	// 响应xml
	router.GET("/xml", response_xml_yaml_test.Xml)
	// 响应yaml
	router.GET("/yaml", response_xml_yaml_test.Yaml)
```

#### function：

```go
package response_xml_yaml_test

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Xml(c *gin.Context) {
	c.XML(200, gin.H{"user": "苏风", "message": "你好~", "status": http.StatusOK})
}

func Yaml(c *gin.Context) {
	c.YAML(200, gin.H{"user": "苏风", "message": "你好~", "status": http.StatusOK})
}

```

### 3.4 返回Html

#### router:

```go
	/*
		响应html
	*/
	router.LoadHTMLGlob("templates/*")
	router.GET("/html", func(c *gin.Context) {
		// 通过HTML渲染
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title":    "Main website",
			"username": "苏风",
		})
	})
```

#### Html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h1>{{.username}}</h1>
<!--Go中通过 {{ .value }}的方式为模板传参-->
</body>
</html>
```

### 3.5 返回文件

#### router：

```go
	/*
		配置文件响应
		在golang中，没有相对文件的路径，它只有相对项目的路径
	*/
	// 网页请求这个静态目录的前缀， 第二个参数是一个目录，注意，前缀不要重复
	router.StaticFS("/static", http.Dir("static/public")) // 将目录下的所有文件都映射到路由上
	// 配置单个文件， 网页请求的路由，文件的路径
	router.StaticFile("/one.png", "static/one.png") // 将文件映射到路由上
```

### 3.6 重定向

```go
	/*
		配置重定向
	*/
	router.GET("/redirect", func(c *gin.Context) {
		//支持内部和外部的重定向
		c.Redirect(http.StatusMovedPermanently, "https://chat.xf233.io")
	})
```

#### 重定向的一些知识：

> ### 301 Moved Permanently
>
> 被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个 URI 之一。如果可能，拥有链接编辑功能的客户端应当自动把请求的地址修改为从服务器反馈回来的地址。除非额外指定，否则这个响应也是可缓存的。
>
> ### 302 Found
>
> 请求的资源现在临时从不同的 URI 响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。



## 4. 请求响应

### 4.1 Query

#### router:

```go
package query

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

func QueryOne(c *gin.Context) {
	// Query的使用
	nameOne := c.Query("name")
	ageOne := c.Query("age")
	fmt.Println(nameOne, ageOne)

	// GetQuery的使用
	// 这里的flagOne和flagTwo是用来判断是否存在这个参数的
	nameTwo, flagOne := c.GetQuery("name")
	ageTwo, flagTwo := c.GetQuery("age")
	fmt.Println(nameTwo, ageTwo, flagOne, flagTwo)

	// QueryArray的使用
	ids := c.QueryArray("ids")
	fmt.Println(ids)

	// QueryMap的使用
	idsMap := c.QueryMap("ids")
	fmt.Println(idsMap)

	// DefaultQuery的使用
	// DefaultQuery("param_name", "default_value")
	nameThree := c.DefaultQuery("name_default", "苏风")
	ageThree := c.DefaultQuery("age_default", "18")
	fmt.Println(nameThree, ageThree)

	c.JSON(200, gin.H{
		"name": nameOne,
		"age":  ageOne,
	})
}
```

#### example:

```bash
curl --location --globoff 'http://127.0.0.1:8080/request/query?name=%E8%8B%8F%E9%A3%8E&age=18&ids=1%2C2%2C3%2C4%2C5&ids[one]=1&ids[two]=2&age_default=23'
```

```
苏风 18
苏风 18 true true
[1,2,3,4,5]
map[one:1 two:2]
苏风 23
```

### 4.2 Param

#### router:

```go
	// 利用Param获取参数
	router.GET("/param/:name/:age", param.Param)
```

#### functions:

```go
package param

import "github.com/gin-gonic/gin"

func Param(c *gin.Context) {
	// Param的使用
	nameOne := c.Param("name")
	ageOne := c.Param("age")
	c.JSON(200, gin.H{
		"name": nameOne,
		"age":  ageOne,
	})
}

```

### 4.3 PostForm

#### router:

```go
	// 获取PostForm参数
	router.POST("/postform", postform.PostForm)
```

#### functions:

```go
package postform

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

func PostForm(c *gin.Context) {
	// PostForm的使用
	nameOne := c.PostForm("name")
	ageOne := c.PostForm("age")
	fmt.Println(nameOne, ageOne)

	// DefaultPostForm的使用
	nameTwo := c.DefaultPostForm("name", "苏风")
	ageTwo := c.DefaultPostForm("age", "18")
	fmt.Println(nameTwo, ageTwo)

	// PostFormArray的使用
	ids := c.PostFormArray("ids")
	fmt.Println(ids)

	// PostFormMap的使用
	idsMap := c.PostFormMap("ids")
	fmt.Println(idsMap)

	// MultipartForm的使用
	form, _ := c.MultipartForm()
	files := form.File["files"]
	for _, file := range files {
		fmt.Println(file.Filename)
	}

	c.JSON(200, gin.H{
		"name": nameOne,
		"age":  ageOne,
	})
}

```

### 4.4 Json

#### router:

```go
	// 获取JSON参数
	router.POST("/jsonOne", json.JsonOne)
	router.POST("/jsonTwo", json.JsonTwo)
```

#### functions:

```go
package json

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"reflect"
)

type UserInfo struct {
	User struct {
		Name    string   `json:"name"`
		Age     string   `json:"age"`
		Address []string `json:"address"`
	} `json:"user"`
	Info struct {
		Account  string `json:"account"`
		Password string `json:"password"`
		Email    string `json:"email"`
	} `json:"info"`
}

func JsonOne(c *gin.Context) {
	// 通过结构体获取参数
	var user UserInfo
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	fmt.Println(user.User.Name)
	fmt.Println(user.User.Age)
	fmt.Println(user.User.Address)
	fmt.Println(reflect.TypeOf(user.User.Address))
	fmt.Println(user.Info.Account)
	fmt.Println(user.Info.Password)
	fmt.Println(user.Info.Email)
}

func JsonTwo(c *gin.Context) {
	// 通过map获取参数
	var data map[string]interface{}
	err := c.ShouldBindJSON(&data)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	user := data["user"].(map[string]interface{})
	info := data["info"].(map[string]interface{})
	fmt.Println(user["name"])
	fmt.Println(user["age"])
	fmt.Println(user["address"])
	fmt.Println(info["account"])
	fmt.Println(info["password"])
	fmt.Println(info["email"])
}

```

### 4.5 Restful风格

#### router:

```go
	// Restful风格
	router.GET("/articles", restful.GetList)
	router.GET("/articles/:id", restful.GetDetail)
	router.POST("/articles", restful.Create)
	router.PUT("/articles/:id", restful.Update)
	router.DELETE("/articles/:id", restful.Delete)
```

#### functions:

```go
package restful

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// 假设的文章结构
type Article struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

var articles = []Article{
	{ID: 1, Title: "文章1", Content: "文章内容1"},
	{ID: 2, Title: "文章2", Content: "文章内容2"},
	// 可以继续添加更多示例文章
}

func GetList(c *gin.Context) {
	c.JSON(http.StatusOK, articles)
}

func GetDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文章ID"})
		return
	}

	for _, a := range articles {
		if a.ID == id {
			c.JSON(http.StatusOK, a)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
}

func Create(c *gin.Context) {
	var newArticle Article
	// 使用ShouldBindJSON代替BindJSON，并自定义错误处理
	if err := c.ShouldBindJSON(&newArticle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求的数据格式不正确，请检查输入"})
		return
	}

	// 添加文章到数组（简化的示例，实际应用中可能会存储到数据库）
	newArticle.ID = len(articles) + 1 // 简单的ID分配逻辑
	articles = append(articles, newArticle)
	c.JSON(http.StatusCreated, newArticle)
}

func Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文章ID"})
		return
	}

	var updatedArticle Article
	// 使用ShouldBindJSON代替BindJSON，并自定义错误处理
	if err := c.ShouldBindJSON(&updatedArticle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求的数据格式不正确，请检查输入"})
		return
	}

	for i, a := range articles {
		if a.ID == id {
			updatedArticle.ID = id // 确保ID不会被更改
			articles[i] = updatedArticle // 更新文章
			c.JSON(http.StatusOK, updatedArticle)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
}


func Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的文章ID"})
		return
	}

	for i, a := range articles {
		if a.ID == id {
			articles = append(articles[:i], articles[i+1:]...) // 删除文章
			c.JSON(http.StatusOK, gin.H{"message": "文章已删除"})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
}

```

## 5. Header操作

### 5.1 router

```go
	// 获取请求头
	router.POST("/get", GetHeader)

	// 设置请求头
	router.POST("/set", SetHeader)
```



### 5.2 获取请求头

```go
func GetHeader(c *gin.Context) {
	// 方式一：
	ContentType := c.GetHeader("Content-Type")
	// 方式二：
	UserAgent := c.Request.Header.Get("User-Agent")
	// 方式三：
	Authorization := c.Request.Header["Authorization"]

	fmt.Println("ContentType: ", ContentType)
	fmt.Println("UserAgent: ", UserAgent)
	fmt.Println("Authorization: ", Authorization)
}
```



### 5.3 设置请求头

```go
func SetHeader(c *gin.Context) {
	// 方式一：
	c.Header("Content-Type", "application/json")
	// 方式二：
	c.Writer.Header().Set("Content-Type", "application/json")
	// 方式三：
	c.Writer.Header()["Content-Type"] = []string{"application/json"}
}
```

## 6. 验证器

### 6.1 常用验证器

```go
// 不能为空，并且不能没有这个字段
required： 必填字段，如：binding:"required"  

// 针对字符串的长度
min 最小长度，如：binding:"min=5"
max 最大长度，如：binding:"max=10"
len 长度，如：binding:"len=6"

// 针对数字的大小
eq 等于，如：binding:"eq=3"
ne 不等于，如：binding:"ne=12"
gt 大于，如：binding:"gt=10"
gte 大于等于，如：binding:"gte=10"
lt 小于，如：binding:"lt=10"
lte 小于等于，如：binding:"lte=10"

// 针对同级字段的
eqfield 等于其他字段的值，如：PassWord string `binding:"eqfield=Password"`
nefield 不等于其他字段的值


- 忽略字段，如：binding:"-"
```

### 6.2 内置验证器

```go
// 枚举  只能是red 或green
oneof=red green 

// 字符串  
contains=fengfeng  // 包含fengfeng的字符串
excludes // 不包含
startswith  // 字符串前缀
endswith  // 字符串后缀

// 数组
dive  // dive后面的验证就是针对数组中的每一个元素

// 网络验证
ip
ipv4
ipv6
uri
url
// uri 在于I(Identifier)是统一资源标示符，可以唯一标识一个资源。
// url 在于Locater，是统一资源定位符，提供找到该资源的确切路径

// 日期验证  1月2号下午3点4分5秒在2006年
datetime=2006-01-02
```

### 6.3 验证器的初步使用

```go
package utils

import "github.com/gin-gonic/gin"

type SignUp struct {
	Username   string `json:"username" binding:"required,min=5,max=10"`
	Age        int    `json:"age"`
	Password   string `json:"password"`
	RePassword string `json:"re_password"`
}

func ValidatorOne(c *gin.Context) {
	var signUp SignUp
	err := c.ShouldBindJSON(&signUp)
	if err != nil {
		c.JSON(200, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, signUp)
}
```

### 6.4 自定义错误信息

```go
type SignUp struct {
	Username   string `json:"username" binding:"required,min=5,max=10" msg:"用户名错误，请检查后重试！"`
	Age        int    `json:"age" binding:"required,gt=10,lt=120" msg:"年龄错误，请检查！"`
	Password   string `json:"password"`
	RePassword string `json:"re_password"`
}

// 自定义验证器
func ValidatorTwo(c *gin.Context) {
	var signUp SignUp
	err := c.ShouldBindJSON(&signUp)
	if err != nil {
		c.JSON(200, gin.H{
			"message": CustomValidator(err, signUp),
		})
		return

	}
}

/*
errors可以写成map的形式，将字段名作为key，错误信息作为value
这里进行了简化，只返回第一个错误信息，让用户一条条去修改
*/
func CustomValidator(err error, object interface{}) string {
	errors := make([]string, 0, 5)
	//var errors []string
	for _, e := range err.(validator.ValidationErrors) {
		field, _ := reflect.TypeOf(object).FieldByName(e.StructField()) // e.StructField()获取错误字段的Go结构体字段名称
		message := field.Tag.Get("msg")
		if message == "" {
			message = "字段" + e.Field() + "验证失败" // e.Field()获取错误字段的json名称
		}
		errors = append(errors, message)
	}
	return errors[0]
}
```

### 6.5 自定义验证器

#### router：

```go
	// 自定义验证器
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("user", validation.UserValidation)
	}

	router.POST("/three", utils.ValidatorThree)
```

#### validation:

```go
package validation

import "github.com/go-playground/validator/v10"

// 自定义验证器函数
// 这里的fl其实也是reflect.value类型
func UserValidation(fl validator.FieldLevel) bool {
	userList := [3]string{"admin", "root", "administrator"}
	username := fl.Field().String()
	for _, user := range userList {
		if username == user {
			return true
		}
	}
	return false
}

```

#### functions:

```go
type User struct {
	Username string `json:"username" binding:"required,user"`
	Password string `json:"password" binding:"required"`
}

// 自定义验证器
func ValidatorThree(c *gin.Context) {
	var User User
	err := c.ShouldBindJSON(&User)
	if err != nil {
		c.JSON(200, gin.H{
			"message": err.Error(),
		})
		return

	}
	c.JSON(200, User)
}

```



## 7. 文件上传

### 7.1 router：

```go
package upload

import (
	"Gin_study/router/upload/service"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.RouterGroup) {
	router.POST("/one", service.UploadOne)
	router.POST("/many", service.UploadMany)
	router.POST("/content", service.UploadContent)
}
```

### 7.2 单文件上传

```go
package service

import (
	"github.com/gin-gonic/gin"
	"io"
	"mime/multipart"
)

// 单文件上传
func UploadOne(c *gin.Context) {
	file, _ := c.FormFile("file")
	// 上传文件到指定的路径
	err := c.SaveUploadedFile(file, "uploadFile/"+file.Filename)
	if err != nil {
		c.String(500, "上传失败")
	}
	c.String(200, "上传成功")
}
```

### 7.3 多文件上传

```go
package service

import (
	"github.com/gin-gonic/gin"
	"io"
	"mime/multipart"
)

// 多文件上传
func UploadMany(c *gin.Context) {
	form, _ := c.MultipartForm()
	files := form.File["file"]
	for _, file := range files {
		// 上传文件到指定的路径
		err := c.SaveUploadedFile(file, "uploadFile/"+file.Filename)
		if err != nil {
			c.String(500, "上传失败")
		}
	}
	c.String(200, "上传成功")
}
```

### 7.4 查看上传文件内容

```go
// 查看上传文件的内容
func UploadContent(c *gin.Context) {
	file, _ := c.FormFile("file")
	fileRead, _ := file.Open()
	defer func(fileRead multipart.File) {
		err := fileRead.Close()
		if err != nil {
			c.String(500, "服务器内部错误！")
		}
	}(fileRead)
	data, _ := io.ReadAll(fileRead)
	c.JSON(200, gin.H{
		"content": string(data),
	})
}
```



## 8. 文件下载

### 8.1 router：

```go
package download

import (
	"Gin_study/router/download/service"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.RouterGroup) {
	router.GET("/file", service.DownloadFile)
}
```

### 8.2 functions:

```go
package service

import (
	"github.com/gin-gonic/gin"
	"net/url"
)

func DownloadFile(c *gin.Context) {
	filename := url.QueryEscape("图片.jpg")                             // 用来处理中文乱码问题
	c.Header("Content-Type", "application/octet-stream")              // 表示是文件流，唤起浏览器下载，一般设置了这个，就要设置文件名
	c.Header("Content-Disposition", "attachment; filename="+filename) // 用来指定下载下来的文件名
	c.Header("Content-Transfer-Encoding", "binary")                   // 表示传输过程中的编码形式，乱码问题可能就是因为它
	c.File("uploadFile/1.jpg")
}
```

### 8.3 前端下载：

```javascript
async download() {
    let res = await axios.get("/download", {headers: {responseType: "blob"}})
    if (res.status === 200) {
        let binaryData = [];
        binaryData.push(res.data);
        let url = window.URL.createObjectURL(new Blob(binaryData)); //表示一个指定的file对象或Blob对象

        let a = document.createElement("a");
        document.body.appendChild(a);

        // 转码文件的标题
        let filename = decodeURI(res.headers.filename)

        // 调起文件下载
        a.href = url;
        a.download = filename; //命名下载名称
        a.click(); //点击触发下载
        window.URL.revokeObjectURL(url);
    }
}
```



## 9. 路由分组

> ​	**在我学习的时候，因为需要写笔记，我从第一节开始就使用了路由分组。我的思想是：在main函数中注册路由组，然后在router目录下去为某个路由组新建文件夹，然后在文件夹下去写一个二级路由初始化这个路由组中所有的子路由。然后在此目录下创建functions目录，去写路由实现的函数。当然这应该不是最佳的方法，或许我们需要在根目录中创建一个单独的service文件夹来实现路由功能更好一些。**

#### main.go

```go
func main() {
	/*
		简单使用示例
	*/
	// 创建一个默认的路由引擎
	router := gin.Default()

	/*
		响应相关
	*/
	// 路由组
	responseRouter := router.Group("/response") // 这里的response是路由组的前缀
	response.InitializeRoutes(responseRouter)   // 初始化路由组

	/*
		请求处理
	*/
	requestRouter := router.Group("/request")
	request.InitializeRoutes(requestRouter)

	/*
		请求头相关
	*/
	HeaderRouter := router.Group("/header")
	header.InitializeRoutes(HeaderRouter)

	/*
		验证器相关
	*/
	validatorRouter := router.Group("/validator")
	Verification.InitializeRoutes(validatorRouter)

	/*
		文件上传
	*/
	uploadRouter := router.Group("/upload")
	upload.InitializeRoutes(uploadRouter)

	/*
		文件下载
	*/
	downloadRouter := router.Group("/download")
	download.InitializeRoutes(downloadRouter)

	/*
		中间件测试
	*/
	middlewareRouter := router.Group("/middleware")
	middleware.InitializeRoutes(middlewareRouter)

	// 绑定端口号，然后启动应用
	err := router.Run(":8080")
	if err != nil {
		fmt.Println("router run error: ", err.Error())
		return
	}

}
```

#### responseRouter示例

```go
package response

import (
	"Gin_study/router/response/response_html"
	"Gin_study/router/response/response_json_test"
	"Gin_study/router/response/response_xml_yaml_test"
	"github.com/gin-gonic/gin"
	"net/http"
)

func InitializeRoutes(router *gin.RouterGroup) {
	/*
		响应json的几种方式
	*/
	// 响应json的第一种方式(常用)
	router.GET("/json_one", response_json_test.JsonOne)
	// 响应json的第二种方式(结构体)
	router.GET("/json_two", response_json_test.JsonTwo)
	// 响应json的第三种方式(map)
	router.GET("/json_three", response_json_test.JsonThree)
	// 响应json的第四种方式(数组)
	router.GET("/json_four", response_json_test.JsonFour)
	// 响应json的第五种方式(自定义,细微控制)
	router.GET("/json_five", response_json_test.JsonFive)

	/*
		响应xml与yaml
	*/
	// 响应xml
	router.GET("/xml", response_xml_yaml_test.Xml)
	// 响应yaml
	router.GET("/yaml", response_xml_yaml_test.Yaml)

	/*
		响应html
	*/
	router.GET("/html", response_html.Html)

	/*
		配置文件响应
		在golang中，没有相对文件的路径，它只有相对项目的路径
	*/
	// 网页请求这个静态目录的前缀， 第二个参数是一个目录，注意，前缀不要重复
	router.StaticFS("/static", http.Dir("static/public")) // 将目录下的所有文件都映射到路由上
	// 配置单个文件， 网页请求的路由，文件的路径
	router.StaticFile("/pic", "static/one.jpg") // 将文件映射到路由上

	/*
		配置重定向
	*/
	router.GET("/redirect", func(c *gin.Context) {
		//支持内部和外部的重定向
		c.Redirect(http.StatusMovedPermanently, "https://chat.xf233.io")
	})

}
```







## 10. 中间件

> Gin框架允许开发者在处理请求的过程中，加入用户自己的钩子（Hook）函数。这个钩子函数就叫中间件，中间件适合处理一些公共的业务逻辑，比如登录认证、权限校验、数据分页、记录日志、耗时统计等。
> 比如，如果访问一个网页的话，不管访问什么路径都需要进行登录，此时就需要为所有路径的处理函数进行统一一个中间件
>
> Gin中的中间件必须是一个gin.HandlerFunc类型



### 10.1 单路由中间件

#### router:

```go
package middleware

import (
	"Gin_study/middleware/functions"
	"fmt"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.RouterGroup) {

	router.GET("/one", functions.One, Index, functions.Two)

}

func Index(c *gin.Context) {
	fmt.Println("Index in")
	name, _ := c.Get("name")
	fmt.Println(name)
	c.JSON(200, gin.H{
		"message": "test",
	})
	c.Next()
	fmt.Println("Index out")
}
```

#### middleware:

```go
package functions

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

/*
c.Next()的作用是执行该中间件之后的其他中间件和函数，通常是需要写响应中间件的时候使用。
c.Abort()的作用是阻止该中间件之后的其他中间件和函数执行，直接从本层开始响应。如果没有c.Abort()，则该中间件之后的其他中间件和函数将会被执行。
c
*/

func One(c *gin.Context) {
	c.Set("name", "中间件One传递的数据") //通过c.Set()方法设置键值对数据，传递给下一个中间件或者函数使用
	fmt.Println("中间件One in")
	//c.Abort()
	c.Next()
	fmt.Println("中间件One out")
}

func Two(c *gin.Context) {
	fmt.Println("中间件Two in")
	c.Next()
	fmt.Println("中间件Two out")
}

```



### 10.2 全局路由中间件

```go
func main() {
	/*
		简单使用示例
	*/
	// 创建一个默认的路由引擎
	router := gin.Default()

	/*
		全局路由中间件
		注意：全局中间件的执行顺序是按照注册顺序执行的，所以一般将全局中间件放在最前面注册，必须在所有路由注册之前注册。
	*/
	router.Use(functions.One, functions.Two) // 所有全局路由中间件都是在路由函数之前执行
}
```



### 10.3 分组路由的中间件

```go
	/*
		中间件测试
		(直接调用分组路由的Use方法为分组路由设置中间件)
	*/
	middlewareRouter := router.Group("/middleware")
	middlewareRouter.Use(functions.One, functions.Two)
	middleware.InitializeRoutes(middlewareRouter)
```



### 10.4 可传参的路由中间件设计

#### router:

```go
func InitializeRoutes(router *gin.RouterGroup) {

	// 可以带有参数的路由组中间件
	router.GET("/two", functions.Three("自定义的中间件信息"), Index, functions.Two) // 这里类似于装饰器的用法

}
```

#### functions:

```go
func Three(msg string) gin.HandlerFunc {
	// 相当于装饰器的写法
	// gin.HandlerFunc是一个类型，它是一个func(c *gin.Context)的别名
	return func(c *gin.Context) {
		fmt.Println("中间件Three in")
		fmt.Println("中间件Three msg:", msg)
		c.Next()
		fmt.Println("中间件Three out")
	}
}
```



### 10.5 中间件使用案例

#### 权限验证

以前后端最流行的jwt为例，如果用户登录了，前端发来的每一次请求都会在请求头上携带上token

后台拿到这个token进行校验，验证是否过期，是否非法

如果通过就说明这个用户是登录过的

不通过就说明用户没有登录

```go
package main

import (
  "github.com/gin-gonic/gin"
)

func JwtTokenMiddleware(c *gin.Context) {
  // 获取请求头的token
  token := c.GetHeader("token")
  // 调用jwt的验证函数
  if token == "1234" {
    // 验证通过
    c.Next()
    return
  }
  // 验证不通过
  c.JSON(200, gin.H{"msg": "权限验证失败"})
  c.Abort()
}

func main() {
  router := gin.Default()

  api := router.Group("/api")

  apiUser := api.Group("")
  {
    apiUser.POST("login", func(c *gin.Context) {
      c.JSON(200, gin.H{"msg": "登录成功"})
    })
  }
  apiHome := api.Group("system").Use(JwtTokenMiddleware)
  {
    apiHome.GET("/index", func(c *gin.Context) {
      c.String(200, "index")
    })
    apiHome.GET("/home", func(c *gin.Context) {
      c.String(200, "home")
    })
  }

  router.Run(":8080")
}
```

#### 耗时统计

统计每一个视图函数的执行时间

```go
func TimeMiddleware(c *gin.Context) {
  startTime := time.Now()
  c.Next()
  since := time.Since(startTime)
  // 获取当前请求所对应的函数
  f := c.HandlerName()
  fmt.Printf("函数 %s 耗时 %d\n", f, since)
}
```



## 11. 分组路由的高级使用

```go
package main

import (
	"Gin_study/middleware"
	"Gin_study/middleware/functions"
	"Gin_study/router/Verification"
	"Gin_study/router/download"
	"Gin_study/router/header"
	"Gin_study/router/request"
	"Gin_study/router/response"
	"Gin_study/router/upload"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

type routeGroup struct {
	initFunc    func(*gin.RouterGroup) // 初始化函数
	comment     string                 // 注释，解释路由组的作用
	middlewares []gin.HandlerFunc      // 中间件列表
}

func main() {
	/*
		简单使用示例
	*/
	// 创建一个默认的路由引擎
	router := gin.Default()

	/*
		全局路由中间件
		注意：全局中间件的执行顺序是按照注册顺序执行的，所以一般将全局中间件放在最前面注册，必须在所有路由注册之前注册。
	*/
	//router.Use(functions.One, functions.Two)

	// 加载模板文件
	router.LoadHTMLGlob("templates/*")

	// 绑定路由规则，执行的函数
	router.GET("/", func(c *gin.Context) {
		c.String(200, "Hello World")
	})

	router.GET("/status", func(c *gin.Context) {
		// 可以用http.StatusXXX()方法获取对应的状态码
		c.String(http.StatusOK, "ok")
	})

	// 路由组初始化映射
    api := router.Group("/api")
	groups := map[string]routeGroup{
		"/response":   {response.InitializeRoutes, "响应相关", nil},
		"/request":    {request.InitializeRoutes, "请求处理", nil},
		"/header":     {header.InitializeRoutes, "请求头相关", nil},
		"/validator":  {Verification.InitializeRoutes, "验证器相关", nil},
		"/upload":     {upload.InitializeRoutes, "文件上传", nil},
		"/download":   {download.InitializeRoutes, "文件下载", nil},
		"/middleware": {middleware.InitializeRoutes, "中间件测试", []gin.HandlerFunc{functions.One, functions.Two}},
	}

	// 遍历映射，注册路由组和中间件
	for prefix, group := range groups {
		g := api.Group(prefix)
		if group.middlewares != nil { // 如果有中间件，则应用它们
			g.Use(group.middlewares...) // 注意：这里的三个点是语法糖，表示将切片打散成多个参数放入
		}
		group.initFunc(g)
	}

	// 绑定端口号，然后启动应用
	err := router.Run(":8080")
	if err != nil {
		fmt.Println("router run error: ", err.Error())
		return
	}

}

```



## 12. gin.Default()解析

```go
func Default() *Engine {
  debugPrintWARNINGDefault()
  engine := New()
  engine.Use(Logger(), Recovery())
  return engine
}
```

> **gin.Default()默认使用了Logger和Recovery中间件，其中：**
>
> **Logger中间件将日志写入gin.DefaultWriter，即使配置了GIN_MODE=release。**
> **Recovery中间件会recover任何panic。如果有panic的话，会写入500响应码。**
> **如果不想使用上面两个默认的中间件，可以使用gin.New()新建一个没有任何默认中间件的路由。**
>
> **使用gin.New，如果不指定日志，那么在控制台中就不会有日志显示**



## 13. 日志

### 13.1 将日志输出到文件

```go
package main

import (
  "github.com/gin-gonic/gin"
  "io"
  "os"
)

func main() {
  // 输出到文件
  f, _ := os.Create("gin.log")
  //gin.DefaultWriter = io.MultiWriter(f)
    
  // 如果需要同时将日志写入文件和控制台，请使用以下代码。
  gin.DefaultWriter = io.MultiWriter(f, os.Stdout)
    
  router := gin.Default()
  router.GET("/", func(c *gin.Context) {
    c.JSON(200, gin.H{"msg": "/"})
  })
  router.Run()
}
```

### 13.2 自定义路由输出格式

```go
package main

import (
  "github.com/gin-gonic/gin"
  "io"
  "os"
)

func main() {
  gin.DebugPrintRouteFunc = func(
  httpMethod,
  absolutePath,
  handlerName string,
  nuHandlers int) {
  log.Printf(
    "[ sufeng ] %v %v %v %v\n",
    httpMethod,
    absolutePath,
    handlerName,
    nuHandlers,
  )
}
    
  router := gin.Default()
  router.GET("/", func(c *gin.Context) {
    c.JSON(200, gin.H{"msg": "/"})
  })
  router.Run()
}

/*  输出如下
2022/12/11 14:10:28 [ sufeng ] GET / main.main.func3 3
2022/12/11 14:10:28 [ sufeng ] POST /index main.main.func4 3
2022/12/11 14:10:28 [ sufeng ] PUT /haha main.main.func5 3
2022/12/11 14:10:28 [ sufeng ] DELETE /home main.main.func6 3
*/
```



### 13.3 修改log输出格式

#### 方式一：

```go
package main

import (
  "fmt"
  "github.com/gin-gonic/gin"
)

func LoggerWithFormatter(params gin.LogFormatterParams) string {
  return fmt.Sprintf(
    "[ Log ] %s  | %d | \t %s | %s | %s \t  %s\n",
    params.TimeStamp.Format("2006/01/02 - 15:04:05"),
    params.StatusCode,  // 状态码
    params.ClientIP,  // 客户端ip
    params.Latency,  // 请求耗时
    params.Method,  // 请求方法
    params.Path,  // 路径
  )
}

func main() {
	router := gin.New()
	router.Use(gin.LoggerWithFormatter(LoggerWithFormatter), gin.Recovery())
    router.Run()
}
```

#### 方式二：

```go
func LoggerWithFormatter(params gin.LogFormatterParams) string {
  return fmt.Sprintf(
    "[ feng ] %s  | %d | \t %s | %s | %s \t  %s\n",
    params.TimeStamp.Format("2006/01/02 - 15:04:05"),
    params.StatusCode,
    params.ClientIP,
    params.Latency,
    params.Method,
    params.Path,
  )
}
func main() {
  router := gin.New()
  router.Use(
    gin.LoggerWithConfig(
      gin.LoggerConfig{Formatter: LoggerWithFormatter},
    ),
  )
  router.Run()

}
```

#### 自定义日志输出颜色：

```go
func LoggerWithFormatter(params gin.LogFormatterParams) string {
  var statusColor, methodColor, resetColor string
  statusColor = params.StatusCodeColor()
  methodColor = params.MethodColor()
  resetColor = params.ResetColor()
  return fmt.Sprintf(
    "[ feng ] %s  | %s %d  %s | \t %s | %s | %s %-7s %s \t  %s\n",
    params.TimeStamp.Format("2006/01/02 - 15:04:05"),
    statusColor, params.StatusCode, resetColor,
    params.ClientIP,
    params.Latency,
    methodColor, params.Method, resetColor,
    params.Path,
  )
}
```



## 14. Cookie相关操作

### router：

```go
package cookie

import (
	"Gin_study/router/cookie/service"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.RouterGroup) {
	/*
		设置cookie
	*/
	router.GET("/set_cookie", service.SetCookie)

	/*
		获取cookie
	*/
	router.GET("/get_cookie", service.GetCookie)

	/*
		删除cookie
	*/
	router.GET("/delete_cookie", service.DeleteCookie)
}
```

### functions:

```go
package service

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

/*
Cookie相关属性简介：
	1. Name：cookie的名字
	2. Value：cookie的值
	3. Path：cookie的路径
	4. Domain：cookie的域名
	5. maxAge：cookie的过期时间
	6. Secure：设置后，Cookie仅通过HTTPS协议传输，不能通过HTTP发送。这有助于保护数据在传输过程中的安全性，避免被窃听。
	7. HttpOnly：设置后，Cookie将无法通过客户端脚本（如JavaScript）访问。这有助于减少跨站脚本攻击（XSS）的风险。

*/

func SetCookie(c *gin.Context) {
	// 设置cookie
	c.SetCookie("username", "xf233", 60, "/", "", false, true)
	c.String(http.StatusOK, "设置cookie成功")
}

func GetCookie(c *gin.Context) {
	// 获取cookie
	username, err := c.Cookie("username")
	if err != nil {
		c.String(http.StatusOK, "获取cookie失败")
	} else {
		c.String(http.StatusOK, "获取cookie成功, username: "+username)
	}
}

func DeleteCookie(c *gin.Context) {
	// 删除cookie
	c.SetCookie("username", "xf233", -1, "/", "", false, true)
	c.String(http.StatusOK, "删除cookie成功")
}
```





## 附录

### 1. 反射：

#### reflect.Type 的方法

`reflect.Type` 接口提供的方法主要用于获取类型的信息和特性。常用的方法包括但不限于：

- `Name() string`：返回类型的名称。
- `Kind() reflect.Kind`：返回类型的基本分类（如 `Int`, `Float`, `Struct` 等）。
- `NumMethod() int`：返回类型的方法数。
- `Method(int) reflect.Method`：返回类型的第 i 个方法。
- `PkgPath() string`：返回类型的包路径。
- `NumField() int`：对于结构体类型，返回其字段数。
- `Field(int) reflect.StructField`：对于结构体类型，返回其第 i 个字段。
- `Implements(u reflect.Type) bool`：判断当前类型是否实现了 `u` 接口。

#### reflect.Value 的方法

`reflect.Value` 类型提供的方法主要用于操作反射对象的值，包括获取和设置值，以及一些特殊类型的操作。常用的方法包括：

- `Interface() interface{}`：返回 `reflect.Value` 所代表的实际值，作为 `interface{}` 类型。
- `Type() reflect.Type`：返回 `reflect.Value` 所代表的值的类型。
- `Kind() reflect.Kind`：返回值的基本分类。
- `Set(reflect.Value)`：设置值。
- `Field(int) reflect.Value`：对于结构体类型，返回其第 i 个字段的值。
- `Method(int) reflect.Value`：返回类型的第 i 个方法的值。
- `Len() int`：对于数组、切片、字符串类型，返回其长度。
- `Index(int) reflect.Value`：对于数组、切片、字符串类型，返回其第 i 个元素的值。
- `CanSet() bool`：检查值是否可以被改变。



### 2. 切片(slices操作)：

`slices`包在 Go 语言中通过提供一系列泛型函数来操作切片，增强了对切片的操作能力

- `Append[S any](s []S, elems ...S) []S`：将一个或多个元素追加到切片末尾，并返回结果切片。
- `Clone[S any](s []S) []S`：创建切片的一个副本。
- `Contains[S comparable](s []S, v S) bool`：检查切片中是否包含指定的值。
- `Delete[S any](s []S, i, j int) []S`：删除切片中从索引 `i` 到 `j`（不包括 `j`）的元素，并返回结果切片。
- `Filter[S any](s []S, keep func(S) bool) []S`：根据给定的条件过滤切片中的元素。
- `Insert[S any](s []S, i int, elems ...S) []S`：在切片的指定位置插入一个或多个元素，并返回结果切片。
- `Equal[S comparable](a, b []S) bool`：比较两个切片是否相等。
- `Index[S comparable](s []S, v S) int`：返回切片中指定值的第一个索引，如果不存在，则返回 -1。
- `Copy[S any](dst, src []S) int`：复制元素从源切片到目标切片，并返回复制的元素数量。
- `Sort[S any](s []S, less func(a, b S) bool)`：根据给定的比较函数对切片进行排序。



### 3. 查看所有注册路由

```go
router.Routes()  // 它会返回已注册的路由列表
```

### 4. 更改运行模式

```go
gin.SetMode(gin.ReleaseMode)
router := gin.Default()
```

### 5. 如何在编译时嵌入模板文件

这里尝试了很多方法，在编译时需要用到Golang在1.16版本新加入的`embed`技术，直接将模板文件加入到编译当中

```go
var (
	//go:embed templates/*
	templateFS embed.FS
)

func main() {
    // 创建一个默认的路由引擎
	router := gin.Default()
    
    // 加载模板文件
	tmpl := template.Must(template.New("").ParseFS(templateFS, "templates/*"))
	router.SetHTMLTemplate(tmpl)
}
```

### 6. 如何在编译的时候嵌入静态文件

#### 映射到路由：

```go
var (
	//go:embed static/*
	staticFS embed.FS
)

func main() {
    // 创建一个默认的路由引擎
	router := gin.Default()
    
    // 获取static目录下的文件系统
	staticFiles, _ := fs.Sub(staticFS, "static") // 获取static目录下的文件系统
	router.StaticFS("/static", http.FS(staticFiles)) // 将 /static 路径下的请求，映射到嵌入的静态文件资源
}
```

#### 程序读取使用：

```go
var (
	//go:embed static/*
	staticFS embed.FS
)

/*
如果仅仅是想让程序读取使用静态文件，上面两部映射没必须要，只需要有嵌入变量就行
*/

func main () {
	// 获取static目录下的特定文件
    data, err := fs.ReadFile(staticFS, "static/some-file.txt")
    if err != nil {
        log.Fatalf("无法读取文件: %v", err)
    }

    // 输出文件内容
    log.Printf("文件内容: %s", data)
}
```

### 7. 编译二进制文件在linux部署

#### 编译命令：

```bash
go env -w GOARCH=amd64
go env -w GOOS=linux
go build -o dist/GinStudy .\main.go
```

#### 运行命令：

```bash
chmod 777 GinStudy
./GinStudy
```

#### 相关知识：

> 编译目标平台linux 64位             GOOS=linux           GOARCH=amd64        go build main.go 
>
> 编译目标平台windows 64位      GOOS=windows    GOARCH=amd64        go build main.go



### 8. 如何将Vue打包后的文件同Golang一起编译

​	**一般来说，Vue3打包后生成的文件类似于以下的结构，我们需要将这些文件移动到我们的golang项目中，你可以在项目根目录新建一个vue文件夹，然后将生成的dist目录复制到vue文件夹下，然后在vue文件夹中创建router.go**

![](https://cdn.xf233.io/static/golang/1.png)

#### main.go

```go
package main

import (
	"Gin_study/middleware"
	"Gin_study/middleware/functions"
	"Gin_study/router/Verification"
	"Gin_study/router/cookie"
	"Gin_study/router/download"
	"Gin_study/router/header"
	"Gin_study/router/request"
	"Gin_study/router/response"
	"Gin_study/router/upload"
	vueRouter "Gin_study/vue"
	"embed"
	"fmt"
	"github.com/gin-gonic/gin"
)

type routeGroup struct {
	initFunc    func(*gin.RouterGroup) // 初始化函数
	comment     string                 // 注释，解释路由组的作用
	middlewares []gin.HandlerFunc      // 中间件列表
}

var (
	//go:embed vue/dist/*
	vue embed.FS
)

func main() {
	// 创建一个默认的路由引擎
	router := gin.Default()

	/*
		加载前端
	*/
	vueRouter.InitializeRoutes(router, vue)
}
```

我们需要在main.go中创建一个入口，初始化前端加载

#### router.go

```go
package vue

import (
	"embed"
	"github.com/gin-gonic/gin"
	"io/fs"
	"net/http"
)

func InitializeRoutes(router *gin.Engine, vue embed.FS) {
	assetsFiles, _ := fs.Sub(vue, "vue/dist/assets") // 获取static目录下的文件系统
	router.StaticFS("/assets", http.FS(assetsFiles))
	router.GET("/favicon.ico", func(context *gin.Context) {
		context.FileFromFS("vue/dist/favicon.ico", http.FS(vue))
	})
	// 捕获所有非静态资源请求并返回index.html
	router.NoRoute(func(c *gin.Context) {
		indexHTML, err := fs.ReadFile(vue, "vue/dist/index.html") // 确保路径正确
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
	})
}

```

这种情况下，后端找不到的路由会从前端去找，前端页面需要做好404等路由及页面
