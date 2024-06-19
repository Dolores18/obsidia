cd /home/learnCode/test/hello

1.创建和写入文件，使用"os.Create"。

在这里写会有格式问题，不能直接复制到linux中。

```
package main
import (
	"fmt"
	"os"
)

func main(){
	file, err := os.Create("example.txt")
	if err != nil{  //不是nill
		fmt.Println("Error creating file:“, err)
		return
	}  //错误提示
	defer file.Close() //创建文件并且关闭
	_，err = file.WriteString("hello,world"\n")
	
	if err != nill_{
		fmt.Println("Error witing to file",err)}
		return
	fmt.Println(File created an  written succcessful")

	
}
```
