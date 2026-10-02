
# OSIRIS Translate

给荷兰高校学生信息系统 **OSIRIS** 做的浏览器翻译扩展。OSIRIS 默认界面大多是荷兰语，国际生经常要点错按钮。这个扩展把常见菜单、按钮、成绩状态翻译成英语或中文，页面有动态内容时也会自动跟上。

![icon](icons/icon48.png)

## 背景

OSIRIS 被 Radboud、Utrecht、TU/e、EUR、Groningen 等学校用来管理课程注册、成绩和学业进度。很多学校把荷兰语界面留给学生，英文切换要么没有，要么只翻译了很小一部分。这个扩展先把最常用、最容易踩坑的 UI 词条本地化了，不需要网络也能用。

## 功能

- 内置荷→英、荷→中两套词条，覆盖菜单、按钮、登录、成绩状态等常用文本。
- 自动翻译 `<title>`、按钮 `value`、placeholder 等属性。
- 监听 DOM 变化，页面切换或异步加载内容时自动补翻。
- 弹窗里一键切换语言、开关翻译。
- 可选在线翻译兜底：内置词典未命中的文本，可配置 LibreTranslate 兼容接口翻译。
- 支持自定义 OSIRIS 域名，适用于学校自己的部署地址。

## 安装

### Chrome / Edge

1. 下载或克隆本项目。
2. 打开 `chrome://extensions/`（或 `edge://extensions/`）。
3. 打开右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择 `osiris-translate` 文件夹。
5. 打开 OSIRIS 页面，点击工具栏里的扩展图标，选择语言即可。

## 使用

- 第一次安装默认启用，界面语言为英文。
- 在任意 OSIRIS 页面点击扩展图标，切换成中文/英文或临时关闭。
- 如果切换语言后部分页面没更新，点“重新翻译”。

## 支持的学校域名

`manifest.json` 里已经包含常见域名，例如：

- `*.osiris.nl`
- `osiris*.nl`
- `sis.eur.nl`、`*.eur.nl`
- `student.osiris.han.nl`、`*.han.nl`

如果你的学校地址不在列表里，打开扩展的“设置”页，把 OSIRIS 网址加进“自定义域名”即可。

## 在线翻译（可选）

默认完全离线。如果想翻译内置词典没收录的内容，可以配置一个 LibreTranslate 兼容接口，例如自托管的：

```
https://你的服务器/translate
```

接口需支持 `POST { q, source: "nl", target, format: "text" }`。开启后，未命中词典的文本会通过后台脚本发往该接口；插件本身不收集、不存储任何页面内容。

## 添加语言或修改词条

所有词条在 `src/dictionaries/` 里：

- `en.js`：荷→英
- `zh.js`：荷→中
- 新增语言：复制一份，改 value 即可；`content.js` 会自动读取所有已加载的词典。

匹配时不区分大小写，也会忽略荷兰语重音符号，所以 key 用原词大小写写就行。

## 隐私

- 默认不开在线翻译，不会向任何服务器发送数据。
- 不开自定义域名时，扩展只在你授权过的 OSIRIS 站点上运行。
- 源码完全开放，没有埋点或统计。

## 贡献

欢迎补充词条、修 bug 或加新语言，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。提 issue 时按模板填会更顺。

## 协议

MIT License。见 [LICENSE](LICENSE)。
