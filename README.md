# XPATH 解析器 Chrome 插件

这是一个用于解析 XPATH 表达式的简约 Chrome 插件。

## 功能特点
- 左侧输入 XPATH 表达式
- 右侧显示解析结果
- 支持实时解析当前页面的 XPATH 表达式

## 文件结构
- manifest.json: 插件配置文件
- floating.css: 界面样式文件
- content.js: 功能实现脚本(内置html界面)

## 界面布局
插件界面分为两个主要区域:
- 左侧为 XPATH 表达式的输入区,包含一个文本输入框和"解析"、"清空"两个按钮。
- 右侧为解析结果的展示区,显示匹配的元素文本内容和对应的匹配行数

## 功能说明
1. 在页面上点击插件图标,打开 XPATH 解析面板
2. 在左侧文本框中输入要解析的 XPATH 表达式
3. 点击"解析"按钮,在右侧区域查看匹配结果
4. 点击"清空"按钮可以清空输入的表达式和解析结果
5. 点击右上角的关闭按钮可以关闭解析面板
6. 支持鼠标拖拽窗口
7. 支持XPath内正则表达式，如/div[*]

## TODO
- [ ] 支持窗口大小调整
- [ ] 确定图标