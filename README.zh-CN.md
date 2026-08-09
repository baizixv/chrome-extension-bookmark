# 书签快存

[English](README.md) | 简体中文

一个使用 React、TypeScript 和 Vite 构建的 Chrome Manifest V3 扩展。它将目标文件夹和插入位置合并到同一棵书签树中，用一次选择完成当前页面的收藏。

## 功能

- 自动读取当前活动标签页的标题、网址和网站图标
- 在固定显示的树形位置框中合并选择文件夹和插入位置
- 默认展开最常用的 Bookmarks Bar，其他目录可逐级展开、折叠
- 单击文件夹保存到顶部，双击文件夹展开或折叠，点击书签则插入到该书签之前，也可选择目录末尾
- 支持跟随系统、简体中文和 English，并使用 Chrome 标准 Manifest 本地化
- 记住上次选择的完整保存位置和语言偏好，并兼容旧版配置迁移
- 当前文件夹存在相同网址时，直接把已有书签移动到新位置
- 支持直接打开 Chrome 书签管理器

## 开发

环境要求：Node.js 20.19 或更高版本。

```bash
npm install
npm run dev
```

`npm run dev` 会监听源码变化并持续构建 `dist/`。修改后需要在 `chrome://extensions/` 中重新加载扩展。

## 检查与构建

```bash
npm run lint
npm run test
npm run format:check
npm run build
```

生产构建输出到 `dist/`，其中包含 Chrome 可直接加载的 `manifest.json`、`popup.html` 和哈希静态资源。

## 安装到 Chrome

1. 执行 `npm install && npm run build`
2. 打开 Chrome，访问 `chrome://extensions/`
3. 打开右上角的“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择本项目的 `dist/` 目录
6. 将“书签快存”固定到工具栏

## Chrome Web Store 发布

发布注册信息、商店文案、权限说明、隐私表单答案和上传清单见：

- [`docs/CHROME_WEB_STORE_PUBLISHING.md`](docs/CHROME_WEB_STORE_PUBLISHING.md)
- [`PRIVACY.md`](PRIVACY.md)

商店图标、截图和宣传图位于 `store-assets/`。更新 UI 后可以重新生成截图：

```bash
npm run store:capture
```

## 代码结构

```text
public/              Manifest、_locales 等扩展静态资源
src/components/      Popup 展示组件、设置菜单和递归书签树
src/domain/          书签树、位置计算和配置迁移等纯逻辑
src/i18n/            类型化中英文 UI 词典与语言解析
src/popup/           Popup 应用入口和流程编排
src/services/        Chrome tabs、bookmarks、storage API 封装
src/store-preview/   商店截图的真实 popup 预览与模拟数据
src/styles/          全局样式
store-assets/        商店图标、截图、宣传图和图标源文件
tests/               领域逻辑和组件交互测试
```
