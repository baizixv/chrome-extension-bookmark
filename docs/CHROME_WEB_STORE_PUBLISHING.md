# Chrome Web Store 发布说明

本文档记录“书签快存 / Bookmark Quick Save”注册、上架和后续更新时需要填写的信息。

## 1. 开发者账号

开发者控制台：https://chrome.google.com/webstore/devconsole

注册前准备：

- Google 账号，并开启两步验证。
- 支付一次性开发者注册费，通常为 5 美元，以控制台实际页面为准。
- 验证开发者联系邮箱。
- 根据实际经营情况选择 Trader 或 Non-trader。个人非商业发布通常选择 Non-trader；公司或以商业目的发布时应按真实情况选择 Trader。

建议登记信息：

| 字段           | 建议内容                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| 开发者显示名称 | Bookmark Quick Save，或你的个人/公司品牌名                                |
| 联系邮箱       | 填写长期可用并已验证的 Google 账号邮箱                                    |
| 项目主页       | https://github.com/baizixv/chrome-extension-bookmark                      |
| 支持页面       | https://github.com/baizixv/chrome-extension-bookmark/issues               |
| 隐私政策       | https://github.com/baizixv/chrome-extension-bookmark/blob/main/PRIVACY.md |

开发者名称和邮箱属于账号身份信息，应填写真实、长期可维护的内容，不要使用临时邮箱。

## 2. 上传文件

上传以下 ZIP，ZIP 根目录中已经包含 `manifest.json`：

```text
dist/bookmark-quick-save-1.6.1.zip
```

上传前重新生成：

```bash
npm ci
npm run check
npm run build
cd dist
zip -r bookmark-quick-save-1.6.1.zip manifest.json popup.html assets _locales icons
```

不要上传项目源码目录、`node_modules/` 或包含外层 `dist/` 目录的 ZIP。

## 3. 商店详情

推荐分类：`Productivity / 生产力工具`

默认语言：`简体中文`

### 中文

名称：

```text
书签快存
```

简短说明：

```text
将当前网页快速保存到指定书签文件夹，并精确插入到顶部、末尾或某个书签之前。
```

详细说明：

```text
书签快存是一款专注于 Chrome 书签归档效率的轻量扩展。

打开扩展即可查看当前页面和完整书签目录。点击文件夹可保存到目录顶部，点击现有书签可插入到该书签之前，也可以选择目录末尾。相同网址已存在时，扩展会移动已有书签，而不是创建重复项。

主要功能：
• 文件夹与插入位置合并选择
• 书签目录逐级展开和折叠
• 默认展开常用的书签栏
• 相同网址自动移动到新位置
• 记住上次选择的保存位置
• 支持跟随系统、简体中文和 English
• 所有数据只在浏览器本地处理
```

### English

Name:

```text
Bookmark Quick Save
```

Short description:

```text
Save the current page to a chosen bookmark folder and place it at the top, bottom, or before another bookmark.
```

Detailed description:

```text
Bookmark Quick Save is a focused Chrome extension for filing bookmarks quickly and precisely.

Open the extension to see the current page and your bookmark tree. Select a folder to save at its top, select an existing bookmark to insert before it, or choose the end of a folder. When the same URL already exists in the target folder, the extension moves the existing bookmark instead of creating a duplicate.

Key features:
• Choose the folder and insertion position in one tree
• Expand and collapse bookmark folders
• Open Bookmarks Bar by default
• Move duplicate URLs to the selected position
• Remember the last save location
• Follow the system language, use Simplified Chinese, or use English
• Process all data locally in the browser
```

## 4. 单一用途

在 Single purpose description 中填写：

```text
帮助用户将当前活动网页保存到指定的 Chrome 书签文件夹和位置，并在目标文件夹已存在相同网址时移动已有书签。
```

英文：

```text
Save the current active page to a user-selected Chrome bookmark folder and position, moving an existing bookmark when the same URL is already present in that folder.
```

## 5. 权限理由

### bookmarks

```text
用于读取 Chrome 书签文件夹树，并根据用户明确选择创建或移动书签。扩展不会删除书签，也不会将书签数据发送到外部服务器。
```

English:

```text
Required to display the Chrome bookmark folder tree and to create or move bookmarks at the location explicitly selected by the user. Bookmark data is never sent to an external server.
```

### activeTab

```text
仅在用户点击扩展按钮后临时读取当前活动标签页的标题、网址和网站图标。扩展不会在后台监控标签页。打开 Chrome 书签管理器不需要额外标签页权限。
```

English:

```text
Temporarily reads the active tab title, URL, and favicon only after the user invokes the extension action. Tabs are not monitored in the background. Opening Chrome's bookmark manager requires no additional tab permission.
```

### storage

```text
用于在 Chrome 本地存储中保存用户选择的书签位置和语言偏好。
```

English:

```text
Used to save the selected bookmark location and language preference in Chrome local storage.
```

本扩展没有 Host permissions、远程代码、广告、分析 SDK 或外部网络请求。

## 6. 隐私权表单

数据处理说明：

- 临时读取当前活动标签页的标题、网址和网站图标。
- 读取书签树，并只根据用户操作创建或移动书签。
- 在 `chrome.storage.local` 中保存书签位置和语言偏好。
- 不向开发者或第三方服务器传输数据。
- 不出售、共享或用于广告、画像、信用评估等用途。

如果表单询问是否收集用户数据，依据当前实现选择“不收集”。扩展会在设备本地处理当前网址和书签数据，但不会将其传输给开发者或第三方。

勾选 Limited Use 声明：

- 不将用户数据出售给第三方。
- 不将用户数据用于与扩展单一用途无关的目的。
- 不将用户数据用于信用评估或借贷。
- 不允许人工读取用户数据，因为数据不会传输给开发者。

隐私政策 URL：

```text
https://github.com/baizixv/chrome-extension-bookmark/blob/main/PRIVACY.md
```

## 7. 商店素材

| 用途       | 文件                                                     | 尺寸     |
| ---------- | -------------------------------------------------------- | -------- |
| 商店图标   | `store-assets/icon-128.png`                              | 128×128  |
| 中文截图   | `store-assets/screenshots/screenshot-zh-CN-1280x800.png` | 1280×800 |
| 英文截图   | `store-assets/screenshots/screenshot-en-1280x800.png`    | 1280×800 |
| 小型宣传图 | `store-assets/promo/small-promo-440x280.png`             | 440×280  |

建议中文商店详情使用中文截图作为第一张，英文详情使用英文截图。宣传图不含边框外文字裁切，可直接上传到 Small promo tile。

## 8. 分发设置

首次发布建议：

- Visibility：先选择 `Unlisted` 完成真实安装验证，确认后再切换 `Public`。
- Regions：无地区限制时选择所有可用地区。
- Pricing：Free。

如果面向欧盟用户，按实际身份完成 Trader disclosure。不要在不确定时填写虚假企业信息。

## 9. 审核备注

可填写：

```text
The extension has no background service worker and makes no external network requests. All bookmark and active-tab data is processed locally. To test: open any regular web page, click the extension action, choose a folder or bookmark position, and click Save bookmark. If the URL already exists in the selected folder, the existing bookmark is moved.
```

## 10. 提交前检查

- [ ] Google 开发者账号邮箱已验证
- [ ] 开启两步验证并支付注册费
- [ ] 上传 `dist/bookmark-quick-save-1.6.1.zip`
- [ ] 中文和英文商店文案已填写
- [ ] 128×128 图标已上传
- [ ] 至少一张 1280×800 截图已上传
- [ ] 440×280 宣传图已上传
- [ ] 单一用途和三个权限理由已填写
- [ ] 隐私表单与 `PRIVACY.md` 内容一致
- [ ] 分发地区、可见性和 Trader 状态已确认
- [ ] 先以 Unlisted 安装验证，再提交 Public 审核

## 11. 后续版本更新

1. 修改 `package.json` 与 `public/manifest.json` 的版本号，Chrome Web Store 不接受重复版本。
2. 执行 `npm run check`。
3. 执行 `npm run build`。
4. 从 `dist/` 根目录重新打 ZIP。
5. 在开发者控制台上传新包，填写版本说明并提交审核。
