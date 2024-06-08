# 项目提交实例

1. 假设项目结构 
 my_project/
├── src/
│   ├── main.py
│   └── utils.py
├── tests/
│   └── test_main.py
└── README.md


2. 按照如下步骤

cd my_project
git init
git add .
git commit -m "Initial commit"
echo "node_modules/" >> .gitignore
echo "*.log" >> .gitignore
echo "build/" >> .gitignore
git add .gitignore
git commit -m "Add .gitignore file"
git remote add origin https://github.com/yourusername/my_project.git
git push -u origin master


3. 



