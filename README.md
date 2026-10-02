# OSIRIS Translate

一个简单的浏览器扩展，把荷兰学生信息系统 **OSIRIS** 的荷兰语界面翻译成英语或中文。尤其适合在荷兰高校（TU Delft、UU、UvA、RUG、WUR 等）读书、但看荷兰语后台吃力的国际学生。

## 安装

1. 下载本项目并解压。
2. 打开 Chrome/Edge → 扩展程序 → 开启「开发者模式」。
3. 选择「加载已解压的扩展程序」，选中 `osiris-translate` 文件夹。
4. 打开任意 OSIRIS 页面，点击工具栏图标切换语言。

## 用法

- 点击扩展图标，选择 **English** 或 **中文**。
- 如果某段文字没翻译到，说明不在内置词典里；可以去 `src/dictionaries/` 里补充词条。
- 页面上的动态内容（下拉刷新、弹窗）会自动被 MutationObserver 处理，无需刷新。

## 隐私

扩展不收集任何数据。内置翻译完全在本地运行；只有你主动开启「在线翻译接口」时，才会把未命中的文本发送到你配置的接口地址。

## 支持的学校域名

扩展默认匹配以下域名模式：

- `*.osiris.nl`
- `*.osiris-hogeschool.nl`
- `*.osiris-student.nl`
- 以及多所荷兰高校的具体子域名

如果学校域名不在列表里，可以在扩展选项页手动添加。

## 协议

MIT License。见 [LICENSE](LICENSE)。

## 贡献

欢迎补充更多词条或新增语言。见 [CONTRIBUTING.md](CONTRIBUTING.md)。
