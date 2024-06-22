# Gorm学习笔记

​	**Gorm是一个使用Go语言编写的ORM（对象关系映射）框架，它是一个开源项目，旨在通过简化数据库操作，使得开发者能够更加便捷地在Go应用程序中进行数据操作和管理。Gorm提供了一种高效的方式来在Go语言程序中与数据库交云，并且支持多种主流的数据库系统，包括MySQL、PostgreSQL、SQLite和Microsoft SQL Server等。**

## 1. Gorm安装

```bash
go get gorm.io/driver/mysql
go get gorm.io/gorm
```



## 2. 数据库连接

### 2.1 简易连接

```go
func init () {
    username := "root"  //账号
    password := "root"  //密码
    host := "127.0.0.1" //数据库地址，可以是Ip或者域名
    port := 3306        //数据库端口
    Dbname := "gorm"   //数据库名
    timeout := "10s"    //连接超时，10秒

    // root:root@tcp(127.0.0.1:3306)/gorm?
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&timeout=%s", username, password, host, port, Dbname, timeout)
    //连接MYSQL, 获得DB类型实例，用于后面的数据库读写操作。
    db, err := gorm.Open(mysql.Open(dsn))
    if err != nil {
      panic("连接数据库失败, error=" + err.Error())
    }
    // 连接成功
    fmt.Println(db)
}
```

### 2.2 高级配置

```go
func init () {
    username := "root"  //账号
    password := "root"  //密码
    host := "127.0.0.1" //数据库地址，可以是Ip或者域名
    port := 3306        //数据库端口
    Dbname := "gorm"   //数据库名
    timeout := "10s"    //连接超时，10秒

    // root:root@tcp(127.0.0.1:3306)/gorm?
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&timeout=%s", username, password, host, port, Dbname, timeout)
    //连接MYSQL, 获得DB类型实例，用于后面的数据库读写操作。
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
      NamingStrategy: schema.NamingStrategy{
		TablePrefix:   "f_",  // 表名前缀
		SingularTable: false, // 单数表名, 为true时，User的表名为user; 为false时，User的表名为users
		NoLowerCase:   false, // 关闭小写转换,开启后,表名会转换为小写
      },
    })
    if err != nil {
      panic("连接数据库失败, error=" + err.Error())
    }
    // 连接成功
    fmt.Println(db)
}
```

#### 命名策略：

**gorm采用的命名策略是，表名是蛇形复数，字段名是蛇形单数**

**例如：**

```go
type Student struct {
  Name      string
  Age       int
  MyStudent string
}
```

**gorm会为我们这样生成表结构：**

```sql
CREATE TABLE `students` (`name` longtext,`age` bigint,`my_student` longtext)
```



## 3. 日志显示

### 3.1 普通日志显示

**gorm的默认日志是只打印错误和慢SQL**

```go
var mysqlLogger logger.Interface

func init() {
	username := "root"  //账号
	password := "root"  //密码
	host := "127.0.0.1" //数据库地址，可以是Ip或者域名
	port := 3306        //数据库端口
	Dbname := "gorm"    //数据库名
	timeout := "10s"    //连接超时，10秒

	// 要显示的日志等级
	mysqlLogger = logger.Default.LogMode(logger.Info)
	
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&timeout=%s", username, password, host, port, Dbname, timeout)
	//连接MYSQL, 获得DB类型实例，用于后面的数据库读写操作。
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix:   "f_",  // 表名前缀
			SingularTable: false, // 单数表名, 为true时，User的表名为user; 为false时，User的表名为users
			NoLowerCase:   false, // 关闭小写转换,开启后,表名会转换为小写
		},
		Logger: mysqlLogger, // 日志
	})
	if err != nil {
		panic("连接数据库失败, error=" + err.Error())
	}
	// 连接成功
	fmt.Println(db)
}
```

### 3.2 自定义日志显示

```go
newLogger := logger.New(
  log.New(os.Stdout, "\r\n", log.LstdFlags), // （日志输出的目标，前缀和日志包含的内容）
  logger.Config{
    SlowThreshold:             time.Second, // 慢 SQL 阈值
    LogLevel:                  logger.Info, // 日志级别
    IgnoreRecordNotFoundError: true,        // 忽略ErrRecordNotFound（记录未找到）错误
    Colorful:                  true,        // 使用彩色打印
  },
)

db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
  Logger: newLogger,
})
```

### 3.2 部分日志显示

```go
func main () {
    var model Student
    session := DB.Session(&gorm.Session{Logger: newLogger})
    session.First(&model)
    // SELECT * FROM `students` ORDER BY `students`.`name` LIMIT 1
}
```



## 4. 模型的定义

### 4.1 模型的定义

**模型是标准的 struct，由 Go 的基本数据类型、实现了 `Scanner` 和 `Valuer` 接口的自定义类型及其指针或别名组成**

#### entity.go:

```go
package model

// 常识：小写属性是不会生成字段的
type User struct {
	ID       int     `json:"id" gorm:"primary_key"`            // 在gorm模型中json是用来序列化的，gorm是用来映射数据库的
	Username string  `json:"username" gorm:"type:varchar(12)"` // 修改字段大小方式一
	Password string  `json:"password" gorm:"size:12"`          // 修改字段大小方式二
	Remark   *string `json:"remark" gorm:"comment:'备注'"`       // 这里采用指针类型，则我们在传值的时候可以传nil，这样在数据库中就是null
}

```



#### index.go:

**`AutoMigrate`的逻辑是只新增，不删除，不修改（但字段类型、大小等会修改）**

```go
package database

import (
	"Gin_study/database/model"
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

var mysqlLogger logger.Interface

func Initialize() {
	// 初始化数据库
	......
    ......
	// 模型初始化
	if err := db.AutoMigrate(&model.User{}); err != nil {
		panic("自动迁移表失败: " + err.Error())
	}

	// 连接成功
	fmt.Println("数据库初始化成功！")
}

```



### 4.2 模型大小的修改

```go
// 两种方式
Name  string  `gorm:"type:varchar(12)"`
Name  string  `gorm:"size:2"`
```



### 4.3 字段标签

- `type` 定义字段类型
- `size` 定义字段大小
- `column` 自定义列名
- `primaryKey` 将列定义为主键
- `unique` 将列定义为唯一键
- `default` 定义列的默认值
- `not null` 不可为空
- `embedded` 嵌套字段
- `embeddedPrefix` 嵌套字段前缀
- `comment` 注释

**多个标签之前用 `;` 连接**



#### 示例：

```go
type StudentInfo struct {
  Email  *string `gorm:"size:32"` // 使用指针是为了存空值
  Addr   string  `gorm:"column:y_addr;size:16"`
  Gender bool    `gorm:"default:true"`
}
type Student struct {
  Name string      `gorm:"type:varchar(12);not null;comment:用户名"`
  UUID string      `gorm:"primaryKey;unique;comment:主键"`
  Info StudentInfo `gorm:"embedded;embeddedPrefix:mygo_"`
}

// 建表语句:
CREATE TABLE `students` (
    `name` varchar(12) NOT NULL COMMENT '用户名',
    `uuid` varchar(191) UNIQUE COMMENT '主键',
    `mygo_email` varchar(32),
    `mygo_y_addr` varchar(16),
    `mygo_gender` boolean DEFAULT true,
    PRIMARY KEY (`uuid`)
)
```

## 5. 单表的增删改查

### 5.1 配置

#### model:

```go
package model

// 常识：小写属性是不会生成字段的
type User struct {
	ID       int     `json:"id" gorm:"primary_key"`                   // 在gorm模型中json是用来序列化的，gorm是用来映射数据库的
	Username string  `json:"username" gorm:"type:varchar(12);unique"` // 修改字段大小方式一
	Password string  `json:"password" gorm:"size:12"`                 // 修改字段大小方式二
	Remark   *string `json:"remark" gorm:"comment:'备注'"`              // 这里采用指针类型，则我们在传值的时候可以传nil，这样在数据库中就是null
}
```



#### entity:

```go
package entity

import "Gin_study/database/model"

type User struct {
	model.User
}

type UserList struct {
	IDList       []int    `json:"idList"`
	UsernameList []string `json:"usernameList"`
}

```



#### router:

```go
package dbOperate

import (
	"Gin_study/router/dbOperate/signleTable"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.RouterGroup) {
	// 初始化路由
	routerOne := router.Group("/signalTable")
	// 插入数据
	routerOne.POST("/insert", signleTable.Insert)
	routerOne.POST("/insertMany", signleTable.InsertMany)
	// 查询数据
	routerOne.POST("/select", signleTable.Select)
	routerOne.POST("/select_where", signleTable.SelectWithWhere)
	routerOne.POST("/select_many", signleTable.SelectMany)
	routerOne.POST("/select_usernames", signleTable.SelectUsernames)
	// 更新数据
	routerOne.POST("/update", signleTable.UpdateAll)
	routerOne.POST("/update_omit", signleTable.UpdateOmit)
	// 删除数据
	routerOne.POST("/delete", signleTable.Delete)
}
```



### 5.2 增

#### Insert

```go
var cursor = database.DB

// 插入单条数据
func Insert(c *gin.Context) {
	var user entity.User
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	// 插入数据
	result := database.DB.Create(&user)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "插入成功",
	})
}
```



#### InsertMany

一次插入多条数据，我们只需要将创建的user变量转换为切片，然后用ShouldBindJSON去绑定接收，随后直接传给DB.Create即可

```go
// 插入多条数据
func InsertMany(c *gin.Context) {
	var users []entity.User         // 定义一个用户切片而不是单个用户对象
	err := c.ShouldBindJSON(&users) // 将请求体绑定到用户切片上
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	// 插入多条数据
	result := database.DB.Create(&users) // 直接传递用户切片到Create方法
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message":  "插入成功",
		"affected": result.RowsAffected, // 返回受影响的行数
	})
}
```



### 5.3 查

#### select：

```go
func Select(c *gin.Context) {
	var (
		request entity.User
		user    model.User
	)
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	result := database.DB.First(&user, request.ID) // 查询id为1的user
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"code": 200,
		"data": user,
	})
}
```

#### selectWithWhere：

```go
func SelectWithWhere(c *gin.Context) {
	var (
		request entity.User
		data    model.User
	)
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}

	result := database.DB.Where("username = ?", request.Username).First(&data) // 根据用户名查询
    // result := database.DB.Take(&data,"where username = ?", request.Username) // 根据用户名查询
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"code": 200,
		"data": data,
	})
}
```

#### selectMany:

```go
func SelectMany(c *gin.Context) {
	var (
		request entity.UserList
		data    []model.User
	)
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	result := database.DB.Find(&data, request.IDList)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"code": 200,
		"data": data,
	})
}
```

#### selectUsernames:

```go
func SelectUsernames(c *gin.Context) {
	var (
		request entity.UserList
		data    []model.User
	)
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	result := database.DB.Where("username in ?", request.UsernameList).Find(&data)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"code": 200,
		"data": data,
	})
}

```



### 5.3 改

#### updateAll:

```go
func UpdateAll(c *gin.Context) {
	var (
		request entity.User
		data    model.User
	)
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	result := database.DB.Model(&data).Where("id = ?", request.ID).Updates(request)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"code":         200,
		"RowsAffected": result.RowsAffected,
	})
}

```

#### updateOmit:

```go
func UpdateOmit(c *gin.Context) {
	var (
		request entity.User
		data    model.User
	)
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	// Omit("username")表示忽略username字段
	result := database.DB.Model(&data).Where("id = ?", request.ID).Omit("username").Updates(request)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"code":         200,
		"RowsAffected": result.RowsAffected,
	})
}
```



### 5.4 删

#### delete:

```go
func Delete(c *gin.Context) {
	// 获取参数
	var (
		userList entity.UserList
		model    entity.User
	)
	err := c.ShouldBindJSON(&userList)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "请求参数错误",
		})
		return
	}
	// 删除数据
	result := database.DB.Delete(&model, userList.IDList)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"message": "数据库操作失败",
			"error":   result.Error.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message":  "删除成功",
		"affected": result.RowsAffected, // 返回受影响的行数
	})
}
```



## 6. Hook

> **GORM 提供了在执行数据库操作前后自动调用的钩子（Hooks）功能，这些钩子可以被用于执行如校验、设置默认值、加密、记录日志等操作。这些钩子包括 `BeforeSave`, `AfterSave`, `BeforeCreate`, `AfterCreate`, `BeforeUpdate`, `AfterUpdate`, `BeforeDelete` 和 `AfterDelete` 等。**

### 示例：

```go
package model

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// 常识：小写属性是不会生成字段的
type User struct {
	ID       int     `json:"id" gorm:"primary_key"`                   // 在gorm模型中json是用来序列化的，gorm是用来映射数据库的
	Username string  `json:"username" gorm:"type:varchar(12);unique"` // 修改字段大小方式一
	Password string  `json:"password" gorm:"size:255"`                // 修改字段大小方式二
	Remark   *string `json:"remark" gorm:"comment:'备注'"`              // 这里采用指针类型，则我们在传值的时候可以传nil，这样在数据库中就是null
}

// BeforeSave GORM的钩子，每次保存之前调用
func (u *User) BeforeSave(tx *gorm.DB) (err error) {
	// 加密密码
	if len(u.Password) > 0 {
		encryptedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err // 如果加密失败，返回错误，保存操作将被中断
		}
		u.Password = string(encryptedPassword)
	}
	return nil
}

// BeforeCreate GORM的钩子，每次创建之前调用
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	// 设置默认备注
	if u.Remark == nil {
		defaultRemark := "默认备注"
		u.Remark = &defaultRemark
	}
	return nil
}
```

### Scan与Value

- `Scan`方法被用于从数据库读取数据时的操作，其中数据以JSON格式存储。当GORM执行查询操作并将结果映射到`User`结构体时，它会调用`Scan`方法。
- `Value`方法被用于在将`User`实例保存到数据库时的操作。这个方法将`User`实例转换为JSON格式，以便可以将其作为一个JSON字符串存储在数据库中。

```go
package model

import (
    "database/sql/driver"
    "encoding/json"
    "errors"
)

// User 定义用户模型
type User struct {
    ID       int     `json:"id" gorm:"primary_key"`
    Username string  `json:"username" gorm:"type:varchar(12);unique"`
    Password string  `json:"password" gorm:"size:255"`
    Remark   *string `json:"remark" gorm:"comment:'备注'"`
}

// Scan 实现 sql.Scanner 接口，用于从数据库读取时将JSON字符串解析为User结构体
func (u *User) Scan(value interface{}) error {
    bytes, ok := value.([]byte)
    if !ok {
        return errors.New("Scan source is not []byte")
    }

    return json.Unmarshal(bytes, u)
}

// Value 实现 driver.Valuer 接口，用于写入数据库时将User结构体转换为JSON字符串
func (u User) Value() (driver.Value, error) {
    if u == (User{}) {
        return nil, nil // 如果User是空结构体，则不存储
    }
    return json.Marshal(u)
}
```





## 7. 查询的高级操作

### 7.1 Select 选择字段

```Go
DB.Select("name", "age").Find(&users)
fmt.Println(users)
// 没有被选中，会被赋零值
```

**可以使用扫描Scan，将选择的字段存入另一个结构体中**

```Go
type User struct {
  Name string
  Age  int
}
var students []Student
var users []User
DB.Select("name", "age").Find(&students).Scan(&users)
fmt.Println(users)
```

**这样写也是可以的，不过最终会查询两次，还是不这样写**

```Go
SELECT `name`,`age` FROM `students`
SELECT `name`,`age` FROM `students`
```

**这样写就只查询一次了**

```Go
type User struct {
  Name string
  Age  int
}
var users []User
DB.Model(&Student{}).Select("name", "age").Scan(&users)
fmt.Println(users)
```

**还可以这样**

```Go
var users []User
DB.Table("students").Select("name", "age").Scan(&users)
fmt.Println(users)
```

**Scan是根据column列名进行扫描的**

```Go
type User struct {
  Name123 string `gorm:"column:name"`
  Age     int
}
var users []User
DB.Table("students").Select("name", "age").Scan(&users)
fmt.Println(users)
```



### 7.2 排序

根据年龄倒序

```Go
var users []Student
DB.Order("age desc").Find(&users)
fmt.Println(users)
// desc    降序
// asc     升序
```

**注意order的顺序**



### 7.3 分页查询

```Go
var users []Student
// 一页两条，第1页
DB.Limit(2).Offset(0).Find(&users)
fmt.Println(users)
// 第2页
DB.Limit(2).Offset(2).Find(&users)
fmt.Println(users)
// 第3页
DB.Limit(2).Offset(4).Find(&users)
fmt.Println(users)
```

**通用写法**

```Go
var users []Student
// 一页多少条
limit := 2
// 第几页
page := 1
offset := (page - 1) * limit
DB.Limit(limit).Offset(offset).Find(&users)
fmt.Println(users)
```



### 7.4 去重

```Go
var ageList []int
DB.Table("students").Select("age").Distinct("age").Scan(&ageList)
fmt.Println(ageList)
```

**或者**

```Go
DB.Table("students").Select("distinct age").Scan(&ageList)
```



### 7.5 分组查询

```Go
var ageList []int
// 查询男生的个数和女生的个数
DB.Table("students").Select("count(id)").Group("gender").Scan(&ageList)
fmt.Println(ageList)
```

**有个问题，哪一个是男生个数，那个是女生个数**

**所以我们应该精确一点**

```Go
type AggeGroup struct {
  Gender int
  Count  int `gorm:"column:count(id)"`
}

var agge []AggeGroup
// 查询男生的个数和女生的个数
DB.Table("students").Select("count(id)", "gender").Group("gender").Scan(&agge)
fmt.Println(agge)
```

**如何再精确一点，具体的男生名字，女生名字**

```Go
type AggeGroup struct {
  Gender int
  Count  int    `gorm:"column:count(id)"`
  Name   string `gorm:"column:group_concat(name)"`
}

var agge []AggeGroup
// 查询男生的个数和女生的个数
DB.Table("students").Select("count(id)", "gender", "group_concat(name)").Group("gender").Scan(&agge)
fmt.Println(agge)
```

**总之，使用gorm不会让你忘记原生sql的编写**



### 7.6 执行原生sql

```Go
type AggeGroup struct {
  Gender int
  Count  int    `gorm:"column:count(id)"`
  Name   string `gorm:"column:group_concat(name)"`
}

var agge []AggeGroup
DB.Raw(`SELECT count(id), gender, group_concat(name) FROM students GROUP BY gender`).Scan(&agge)

fmt.Println(agge)
```



### 7.7 子查询

**查询大于平均年龄的用户**

```Go
# 原生sql
select * from students where age > (select avg(age) from students);
```

**使用gorm编写**

```Go
var users []Student
DB.Model(Student{}).Where("age > (?)", DB.Model(Student{}).Select("avg(age)")).Find(&users)
fmt.Println(users)
```



### 7.8 命名参数

```Go
var users []Student

DB.Where("name = @name and age = @age", sql.Named("name", "枫枫"), sql.Named("age", 23)).Find(&users)
DB.Where("name = @name and age = @age", map[string]any{"name": "枫枫", "age": 23}).Find(&users)
fmt.Println(users)
```



### 7.9 find到map

```Go
var res []map[string]any
DB.Table("students").Find(&res)
fmt.Println(res)
```



### 7.10 查询引用Scope

**可以再model层写一些通用的查询方式，这样外界就可以直接调用方法即可**

```Go
func Age23(db *gorm.DB) *gorm.DB {
  return db.Where("age > ?", 23)
}

func main(){
  var users []Student
  DB.Scopes(Age23).Find(&users)
  fmt.Println(users)
}
```

## 8. 联合查询

### 8.1 一对多关系 表结构建立

**在gorm中，官方文档是把一对多关系分为了两类，**

**Belongs To 属于谁**

**Has Many 我拥有的**

**他们本来是一起的，本教程把它们合在一起讲**

**我们以用户和文章为例**

**一个用户可以发布多篇文章，一篇文章属于一个用户**

```Go
type User struct {
  ID       uint      `gorm:"size:4"`
  Name     string    `gorm:"size:8"`
  Articles []Article // 用户拥有的文章列表
}

type Article struct {
  ID     uint   `gorm:"size:4"`
  Title  string `gorm:"size:16"`
  UserID uint   // 属于   这里的类型要和引用的外键类型一致，包括大小
  User   User   // 属于
}
```

关于外键命名，外键名称就是关联表名+ID，类型是uint

#### 重写外键关联

```Go
type User struct {
  ID       uint      `gorm:"size:4"`
  Name     string    `gorm:"size:8"`
  Articles []Article `gorm:"foreignKey:UID"` // 用户拥有的文章列表
}

type Article struct {
  ID    uint   `gorm:"size:4"`
  Title string `gorm:"size:16"`
  UID   uint   // 属于
  User  User   `gorm:"foreignKey:UID"` // 属于
}
```

**这里有个地方要注意**

**我改了Article 的外键，将UID作为了外键，那么User这个外键关系就要指向UID**

**与此同时，User所拥有的Articles也得更改外键，改为UID**

#### 重写外键引用

```Go
type User struct {
  ID       uint      `gorm:"size:4"`
  Name     string    `gorm:"size:8"`
  Articles []Article `gorm:"foreignKey:UserName;references:Name"` // 用户拥有的文章列表
}

type Article struct {
  ID       uint   `gorm:"size:4"`
  Title    string `gorm:"size:16"`
  UserName string
  User     User `gorm:"references:Name"` // 属于
}
```

这一块的逻辑比较复杂

比如有1个用户

|      |      |
| ---- | ---- |
| id   | name |
| 1    | 枫枫 |

之前的外键关系是这样表示文章的

|      |            |         |
| ---- | ---------- | ------- |
| id   | title      | user_id |
| 1    | python     | 1       |
| 2    | javascript | 1       |
| 3    | golang     | 1       |

**如果改成直接关联Name，那就变成了这样**

|      |            |           |
| ---- | ---------- | --------- |
| id   | title      | user_name |
| 1    | python     | 枫枫      |
| 2    | javascript | 枫枫      |
| 3    | golang     | 枫枫      |

虽然这样很方便，但是非常不适合在实际项目中这样用

我们还是用第一版的表结构做一对多关系的增删改查

### 8.2 一对多的添加

**创建用户，并且创建文章**

```Go
a1 := Article{Title: "python"}
a2 := Article{Title: "golang"}
user := User{Name: "枫枫", Articles: []Article{a1, a2}}
DB.Create(&user)
```

gorm自动创建了两篇文章，以及创建了一个用户，还将他们的关系给关联上了

创建文章，关联已有用户

```Go
a1 := Article{Title: "golang零基础入门", UserID: 1}
DB.Create(&a1)
var user User
DB.Take(&user, 1)
DB.Create(&Article{Title: "python零基础入门", User: user})
```

### 8.3 外键添加

给现有用户绑定文章

```Go
var user User
DB.Take(&user, 2)

var article Article
DB.Take(&article, 5)

user.Articles = []Article{article}
DB.Save(&user)
```

**也可以用Append方法**

```Go
var user User
DB.Take(&user, 2)

var article Article
DB.Take(&article, 5)

//user.Articles = []Article{article}
//DB.Save(&user)

DB.Model(&user).Association("Articles").Append(&article)
```

给现有文章关联用户

```Go
var article Article
DB.Take(&article, 5)

article.UserID = 2
DB.Save(&article)
```

**也可用Append方法**

```Go
var user User
DB.Take(&user, 2)

var article Article
DB.Take(&article, 5)

DB.Model(&article).Association("User").Append(&user)
```

### 8.4 查询

查询用户，显示用户的文章列表

```Go
var user User
DB.Take(&user, 1)
fmt.Println(user)
```

直接这样，是显示不出文章列表

#### 预加载

我们必须要使用预加载来加载文章列表

```Go
var user User
DB.Preload("Articles").Take(&user, 1)
fmt.Println(user)
```

**预加载的名字就是外键关联的属性名**

**查询文章，显示文章用户的信息**

**同样的，使用预加载**

```Go
var article Article
DB.Preload("User").Take(&article, 1)
fmt.Println(article)
```

#### 嵌套预加载

查询文章，显示用户，并且显示用户关联的所有文章，这就得用到嵌套预加载了

```Go
var article Article
DB.Preload("User.Articles").Take(&article, 1)
fmt.Println(article)
```

#### 带条件的预加载

查询用户下的所有文章列表，过滤某些文章

```Go
var user User
DB.Preload("Articles", "id = ?", 1).Take(&user, 1)
fmt.Println(user)
```

这样，就只有id为1的文章被预加载出来了

#### 自定义预加载

```Go
var user User
DB.Preload("Articles", func(db *gorm.DB) *gorm.DB {
  return db.Where("id in ?", []int{1, 2})
}).Take(&user, 1)
fmt.Println(user)
```

### 8.5 删除

#### 级联删除

删除用户，与用户关联的文章也会删除

```Go
var user User
DB.Take(&user, 1)
DB.Select("Articles").Delete(&user)
```

#### 清除外键关系

删除用户，与将与用户关联的文章，外键设置为null

```Go
var user User
DB.Preload("Articles").Take(&user, 2)
DB.Model(&user).Association("Articles").Delete(&user.Articles)
```



一对一关系比较少，一般用于表的扩展

例如一张用户表，有很多字段

那么就可以把它拆分为两张表，常用的字段放主表，不常用的字段放详情表

### 8.6 一对一关系 表结构建立

```Go
type User struct {
  ID       uint
  Name     string
  Age      int
  Gender   bool
  UserInfo UserInfo // 通过UserInfo可以拿到用户详情信息
}

type UserInfo struct {
  UserID uint // 外键
  ID     uint
  Addr   string
  Like   string
}
```

#### 添加记录

添加用户，自动添加用户详情

```Go
DB.Create(&User{
  Name:   "枫枫",
  Age:    21,
  Gender: true,
  UserInfo: UserInfo{
    Addr: "湖南省",
    Like: "写代码",
  },
})
```

添加用户详情，关联已有用户

这个场景特别适合网站的注册，以及后续信息完善

刚开始注册的时候，只需要填写很基本的信息，这就是添加主表的一条记录

注册进去之后，去个人中心，添加头像，修改地址...

这就是添加附表

```Go
DB.Create(&UserInfo{
  UserID: 2,
  Addr:   "南京市",
  Like:   "吃饭",
})
```

当然，也可以直接把用户对象传递进来

我们需要改一下表结构

```Go
type User struct {
  ID       uint
  Name     string
  Age      int
  Gender   bool
  UserInfo UserInfo // 通过UserInfo可以拿到用户详情信息
}

type UserInfo struct {
  User *User  // 要改成指针，不然就嵌套引用了
  UserID uint // 外键
  ID     uint
  Addr   string
  Like   string
}
```

不限于重新迁移，直接添加即可

```Go
var user User
DB.Take(&user, 2)
DB.Create(&UserInfo{
  User: &user,
  Addr: "南京市",
  Like: "吃饭",
})
```

#### 查询

一般是通过主表查副表

```Go
var user User
DB.Preload("UserInfo").Take(&user)
fmt.Println(user)
```



多对多关系，需要用第三张表存储两张表的关系

### 8.7 多对多关系 表结构建立

```Go
type Tag struct {
  ID       uint
  Name     string
  Articles []Article `gorm:"many2many:article_tags;"` // 用于反向引用
}

type Article struct {
  ID    uint
  Title string
  Tags  []Tag `gorm:"many2many:article_tags;"`
}
```

#### 多对多添加

添加文章，并创建标签

```Go
DB.Create(&Article{
  Title: "python基础课程",
  Tags: []Tag{
    {Name: "python"},
    {Name: "基础课程"},
  },
})
```

添加文章，选择标签

```Go
var tags []Tag
DB.Find(&tags, "name = ?", "基础课程")
DB.Create(&Article{
  Title: "golang基础",
  Tags:  tags,
})
```



#### 多对多查询

查询文章，显示文章的标签列表

```Go
var article Article
DB.Preload("Tags").Take(&article, 1)
fmt.Println(article)
```

查询标签，显示文章列表

```Go
var tag Tag
DB.Preload("Articles").Take(&tag, 2)
fmt.Println(tag)
```



#### 多对多更新

移除文章的标签

```Go
var article Article
DB.Preload("Tags").Take(&article, 1)
DB.Model(&article).Association("Tags").Delete(article.Tags)
fmt.Println(article)
```

更新文章的标签

```Go
var article Article
var tags []Tag
DB.Find(&tags, []int{2, 6, 7})

DB.Preload("Tags").Take(&article, 2)
DB.Model(&article).Association("Tags").Replace(tags)
fmt.Println(article)
```



#### 自定义连接表

默认的连接表，只有双方的主键id，展示不了更多信息了

这是官方的例子，我修改了一下

```Go
type Article struct {
  ID    uint
  Title string
  Tags  []Tag `gorm:"many2many:article_tags"`
}

type Tag struct {
  ID   uint
  Name string
}

type ArticleTag struct {
  ArticleID uint `gorm:"primaryKey"`
  TagID     uint `gorm:"primaryKey"`
  CreatedAt time.Time
}
```

##### 生成表结构

```Go
// 设置Article的Tags表为ArticleTag
DB.SetupJoinTable(&Article{}, "Tags", &ArticleTag{})
// 如果tag要反向应用Article，那么也得加上
// DB.SetupJoinTable(&Tag{}, "Articles", &ArticleTag{})
err := DB.AutoMigrate(&Article{}, &Tag{}, &ArticleTag{})
fmt.Println(err)
```

##### 操作案例

举一些简单的例子

1. 添加文章并添加标签，并自动关联
2. 添加文章，关联已有标签
3. 给已有文章关联标签
4. 替换已有文章的标签
5. 添加文章并添加标签，并自动关联

```Go
DB.SetupJoinTable(&Article{}, "Tags", &ArticleTag{})  // 要设置这个，才能走到我们自定义的连接表
DB.Create(&Article{
  Title: "flask零基础入门",
  Tags: []Tag{
    {Name: "python"},
    {Name: "后端"}, 
    {Name: "web"},
  },
})
// CreatedAt time.Time 由于我们设置的是CreatedAt，gorm会自动填充当前时间，
// 如果是其他的字段，需要使用到ArticleTag 的添加钩子 BeforeCreate
```

1. 添加文章，关联已有标签

```Go
DB.SetupJoinTable(&Article{}, "Tags", &ArticleTag{})
var tags []Tag
DB.Find(&tags, "name in ?", []string{"python", "web"})
DB.Create(&Article{
  Title: "flask请求对象",
  Tags:  tags,
})
```

1. 给已有文章关联标签

```Go
DB.SetupJoinTable(&Article{}, "Tags", &ArticleTag{})
article := Article{
  Title: "django基础",
}
DB.Create(&article)
var at Article
var tags []Tag
DB.Find(&tags, "name in ?", []string{"python", "web"})
DB.Take(&at, article.ID).Association("Tags").Append(tags)
```

1. 替换已有文章的标签

```Go
var article Article
var tags []Tag
DB.Find(&tags, "name in ?", []string{"后端"})
DB.Take(&article, "title = ?", "django基础")
DB.Model(&article).Association("Tags").Replace(tags)
```

1. 查询文章列表，显示标签

```Go
var articles []Article
DB.Preload("Tags").Find(&articles)
fmt.Println(articles)
```

##### SetupJoinTable

添加和更新的时候得用这个

这样才能走自定义的连接表，以及走它的钩子函数

查询则不需要这个



#### 自定义连接表主键

这个功能还是很有用的，例如你的文章表 可能叫ArticleModel，你的标签表可能叫TagModel

那么按照gorm默认的主键名，那就分别是ArticleModelID，TagModelID，太长了，根本就不实用

这个地方，官网给的例子看着也比较迷，不过我已经跑通了

主要是要修改这两项

joinForeignKey 连接的主键id

JoinReferences 关联的主键id

```Go
type ArticleModel struct {
  ID    uint
  Title string
  Tags  []TagModel `gorm:"many2many:article_tags;joinForeignKey:ArticleID;JoinReferences:TagID"`
}

type TagModel struct {
  ID       uint
  Name     string
  Articles []ArticleModel `gorm:"many2many:article_tags;joinForeignKey:TagID;JoinReferences:ArticleID"`
}

type ArticleTagModel struct {
  ArticleID uint `gorm:"primaryKey"` // article_id
  TagID     uint `gorm:"primaryKey"` // tag_id
  CreatedAt time.Time
}
```

##### 生成表结构

```Go
DB.SetupJoinTable(&ArticleModel{}, "Tags", &ArticleTagModel{})
DB.SetupJoinTable(&TagModel{}, "Articles", &ArticleTagModel{})
err := DB.AutoMigrate(&ArticleModel{}, &TagModel{}, &ArticleTagModel{})
fmt.Println(err)
```

添加，更新，查询操作和上面的都是一样



##### 操作连接表

如果通过一张表去操作连接表，这样会比较麻烦

比如查询某篇文章关联了哪些标签

或者是举个更通用的例子，用户和文章，某个用户在什么时候收藏了哪篇文章

无论是通过用户关联文章，还是文章关联用户都不太好查

最简单的就是直接查连接表

```Go
type UserModel struct {
  ID       uint
  Name     string
  Collects []ArticleModel `gorm:"many2many:user_collect_models;joinForeignKey:UserID;JoinReferences:ArticleID"`
}

type ArticleModel struct {
  ID    uint
  Title string
  // 这里也可以反向引用，根据文章查哪些用户收藏了
}

// UserCollectModel 用户收藏文章表
type UserCollectModel struct {
  UserID    uint `gorm:"primaryKey"` // article_id
  ArticleID uint `gorm:"primaryKey"` // tag_id
  CreatedAt time.Time
}

func main() {
  DB.SetupJoinTable(&UserModel{}, "Collects", &UserCollectModel{})
  err := DB.AutoMigrate(&UserModel{}, &ArticleModel{}, &UserCollectModel{})
  fmt.Println(err)
}
```

常用的操作就是根据用户查收藏的文章列表

```Go
var user UserModel
DB.Preload("Collects").Take(&user, "name = ?", "枫枫")
fmt.Println(user)
```

但是这样不太好做分页，并且也拿不到收藏文章的时间

```Go
var collects []UserCollectModel
DB.Find(&collects, "user_id = ?", 2)
fmt.Println(collects)
```

这样虽然可以查到用户id，文章id，收藏的时间，但是搜索只能根据用户id搜，返回也拿不到用户名，文章标题等

我们需要改一下表结构，不需要重新迁移，加一些字段

```Go
type UserModel struct {
  ID       uint
  Name     string
  Collects []ArticleModel `gorm:"many2many:user_collect_models;joinForeignKey:UserID;JoinReferences:ArticleID"`
}

type ArticleModel struct {
  ID    uint
  Title string
}

// UserCollectModel 用户收藏文章表
type UserCollectModel struct {
  UserID       uint         `gorm:"primaryKey"` // article_id
  UserModel    UserModel    `gorm:"foreignKey:UserID"`
  ArticleID    uint         `gorm:"primaryKey"` // tag_id
  ArticleModel ArticleModel `gorm:"foreignKey:ArticleID"`
  CreatedAt    time.Time
}
```

查询

```Go
var collects []UserCollectModel

var user UserModel
DB.Take(&user, "name = ?", "枫枫")
// 这里用map的原因是如果没查到，那就会查0值，如果是struct，则会忽略零值，全部查询
DB.Debug().Preload("UserModel").Preload("ArticleModel").Where(map[string]any{"user_id": user.ID}).Find(&collects)

for _, collect := range collects {
  fmt.Println(collect)
}
```





# 附录

## 1. CRUD命令速查

### 1.1 增

```go
package main

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// 定义用户模型
type User struct {
    gorm.Model
    Name string
    Age  int
}

func main() {
    // 连接到数据库
    db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        panic("连接数据库失败")
    }

    // 自动迁移模式，确保数据库表结构是最新的
    db.AutoMigrate(&User{})

    // Create：插入单条记录到数据库
    // 创建一个新的User实例并添加到数据库
    db.Create(&User{Name: "John", Age: 30})
    // 此操作会插入一个名字为John，年龄为30的用户记录到数据库中。

    // 批量插入
    // 同时创建多个用户记录，可以提高插入效率
    users := []User{
        {Name: "Jane", Age: 25},
        {Name: "Victor", Age: 32},
    }
    db.Create(&users)
    // 通过传递一个包含User实例的切片给Create方法，GORM会生成一条SQL语句来一次性插入所有记录。

    // 使用Select指定插入的字段
    // 当你不想插入结构体的所有字段时，可以使用Select指定部分字段进行插入
    db.Select("Name", "Age").Create(&User{Name: "Sam", Age: 29})
    // 这将只将Name和Age字段的值插入到数据库中，忽略模型中的其他字段。

    // 使用Omit排除某些字段
    // 在插入操作中排除特定的字段
    db.Omit("Age").Create(&User{Name: "Alex"})
    // 这将创建一个新用户Alex，但在插入操作中排除了Age字段，只插入Name字段和其他默认字段。

    // 注意：在使用Create方法进行数据插入时，GORM还支持钩子函数（如BeforeCreate、AfterCreate等），允许在插入操作前后执行自定义逻辑。
}

```

### 1.2 删

```go
package main

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// 定义用户模型
type User struct {
    gorm.Model
    Name string
    Age  int
}

func main() {
    // 连接到数据库
    db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        panic("连接数据库失败")
    }

    // 自动迁移模式，确保数据库表结构是最新的
    db.AutoMigrate(&User{})

    // Delete：删除指定记录
    // 删除名字为"John"的用户
    db.Where("name = ?", "John").Delete(&User{})
    // 此操作将从数据库中删除所有名字为John的用户记录。
    // 注意: GORM在执行Delete操作时默认会使用软删除(如果模型包含DeletedAt字段)，即只标记记录为删除状态而不是从数据库中永久删除。

    // 使用模型的主键删除
    // 假设已知用户的ID为1，直接使用ID进行删除
    db.Delete(&User{}, 1)
    // 此操作将根据主键ID删除用户，这里删除ID为1的用户。
    
    // 假设我们有一个ID数组，想要删除这些ID对应的用户
    idsToDelete := []int{1, 2, 3}
    // 使用Where和Delete函数根据ID数组删除记录
    db.Where("id IN ?", idsToDelete).Delete(&User{})
    // 此操作将从数据库中删除ID为1, 2, 3的用户记录。

    // 批量删除
    // 删除年龄大于30的所有用户
    db.Where("age > ?", 30).Delete(&User{})
    // 此操作将从数据库中删除所有年龄大于30岁的用户记录。
    // 注意: 执行批量删除操作时，GORM不会自动调用模型的Delete hook，这是为了性能考虑。

    // 使用Unscoped进行物理删除
    // 如果要从数据库中永久删除记录（忽略软删除），可以使用Unscoped方法
    db.Unscoped().Where("name = ?", "John").Delete(&User{})
    // 此操作将永久删除所有名字为John的用户记录，不留下软删除的痕迹。
}

```

### 1.3 改

```go
package main

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// 定义用户模型
type User struct {
    gorm.Model
    Name string
    Age  int
}

func main() {
    // 连接到数据库
    db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        panic("连接数据库失败")
    }

    // 自动迁移模式，确保数据库表结构是最新的
    db.AutoMigrate(&User{})

    // 更新单个字段
    // 假设我们要更新ID为1的用户的名称
    db.Model(&User{}).Where("id = ?", 1).Update("Name", "Jane")
    // 此操作将用户ID为1的记录的Name字段更新为"Jane"。

    // 更新多个字段
    // 可以一次性更新多个字段
    db.Model(&User{}).Where("id = ?", 1).Updates(User{Name: "Mike", Age: 30})
    // 此操作将用户ID为1的记录的Name字段更新为"Mike"，Age字段更新为30。
    // 注意: 使用Updates时，只有非零值的字段才会被更新。

    // 使用map更新多个字段
    // 也可以使用map来更新多个字段，这对于动态字段更新特别有用
    db.Model(&User{}).Where("id = ?", 1).Updates(map[string]interface{}{"Name": "Sarah", "Age": 28})
    // 此操作将用户ID为1的记录的Name字段更新为"Sarah"，Age字段更新为28。

    // 无hooks更新
    // 如果你不希望GORM调用任何hooks（如BeforeUpdate等），可以使用UpdateColumn或UpdatesColumn
    db.Model(&User{}).Where("id = ?", 1).UpdateColumn("Age", 29)
    // 此操作将用户ID为1的记录的Age字段更新为29，且不会触发任何hooks。

    // 批量更新
    // 更新所有用户的年龄加1
    db.Model(&User{}).Updates(User{Age: gorm.Expr("age + ?", 1)})
    // 此操作将所有用户的Age字段加1。
    // 使用gorm.Expr允许我们在更新语句中使用SQL表达式。

    // 注意: 在批量更新操作中，GORM默认更新模型的所有字段，即使字段值没有变化。
    // 若要只更新发生变化的字段，可以使用Select指定要更新的字段。
}

```

### 1.4 查

```go
// 定义用户模型
var users []User
var user User
var count int
var names []string

// First：查询表中的第一条记录（按主键排序），并将其赋值给user
db.First(&user)

// Find：查询表中的所有记录，并将结果赋值给users切片
db.Find(&users)

// Take：查询表中的一条记录，不考虑顺序，并将其赋值给user
db.Take(&user)

// 以上三个函数，第二个参数位可以直接写入主键序号进行查询，如db.Find(&users,1)

// 直接在Take函数中写查询条件
DB.Take(&student, "name = ?", "机器人27号' or 1=1;#")

// Where：根据给定条件查询记录。这里查找名字为"John"的所有用户，并赋值给users切片
db.Where("name = ?", "John").Find(&users)

// Not：查询不匹配条件的记录。这里查找名字不是"John"的所有用户，并赋值给users切片
db.Not("name = ?", "John").Find(&users)

// Or：查询匹配任一条件的记录。这里查找名字是"John"或者年龄小于20的所有用户，并赋值给users切片
db.Or("name = ?", "John").Or("age < ?", 20).Find(&users)

// Select：指定查询的字段。这里只查询用户的"name"和"age"字段
db.Select("name", "age").Find(&users)

// Order：根据指定字段进行排序。这里按照"age"字段降序排列
db.Order("age desc").Find(&users)

// Limit：限制查询结果的数量。这里限制结果为前10条记录
db.Limit(10).Find(&users)

// Offset：指定查询结果的偏移量。这里从第5条记录开始查询
db.Offset(5).Find(&users)

// Group & Having：按照指定字段分组，并对分组结果使用HAVING过滤。这里按"city"分组，筛选出每组数量大于10的记录
db.Group("city").Having("count(*) > ?", 10).Find(&users)

// Joins：执行连接查询。这里通过JOIN语句连接地址表，并查询出用户及其地址
db.Joins("JOIN addresses ON addresses.user_id = users.id").Find(&users)

// Preload：预加载关联模型，实现Eager loading。这里预加载了每个用户的订单信息
db.Preload("Orders").Find(&users)

// Count：计算满足条件的记录数量。这里计算用户表中的记录数，并将结果赋值给count
db.Model(&User{}).Count(&count)

// Pluck：查询指定列的所有值。这里查询所有用户的"name"列，并将结果赋值给names切片
db.Model(&User{}).Pluck("name", &names)

// Distinct：查询不重复的记录。这里查询不重复的"name"字段的所有用户
db.Distinct("name").Find(&users)
```

