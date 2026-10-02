# 参与贡献

欢迎提交词条、修 bug 或加新语言。下面几条能让你的 PR 更快被合并。

## 加词条

最常见的贡献是给内置词典补词。编辑 `src/dictionaries/` 下的文件：

- `en.js`：荷兰语 → 英语
- `zh.js`：荷兰语 → 中文

两个文件的 **key 必须一致**（同一个荷兰语词在两处都要出现），value 是对应的译文。
匹配时会自动忽略大小写和重音，所以 key 直接照界面上的写法写就行，不用纠结大小写。

```js
'Punten': 'Points',  // en.js
'Punten': '学分',    // zh.js
```

只要是 OSIRIS 界面里真实出现的文本就可以提，不要求覆盖整句。

## 加新语言

复制 `en.js`，改文件名（例如 `ja.js`），把 value 换成目标语言，并挂到 `self.__OSIRIS_DICTS__.ja`。
`content.js` 会自动加载所有被注入的词典；想让它在弹窗下拉里出现，再给 `src/popup.html` 的 `<select>` 加一行即可。

## 本地测试

- Chrome / Edge：打开 `chrome://extensions`，开“开发者模式”，加载 `osiris-translate` 目录。
- Firefox：打开 `about:debugging#/runtime/this-firefox`，临时载入附加组件，选 `manifest.json`。
- 进任意 OSIRIS 站点，点扩展图标切换语言验证效果。

## 提交

- commit 信息写清楚改了什么，比如 `dict: add exam terms`、`feat: Japanese support`。
- 不要把私钥、token 这类东西提交进来。

提交前用 `node --check` 确认 JS 没有语法错误即可，这个项目没有构建步骤。

