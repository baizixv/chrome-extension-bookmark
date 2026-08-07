# Privacy Policy / 隐私政策

Effective date / 生效日期：2026-08-07

## 中文

“书签快存”是一款在 Chrome 浏览器本地运行的书签管理扩展。本隐私政策说明扩展访问哪些数据以及如何使用这些数据。

### 扩展访问的数据

扩展仅在用户打开扩展或执行保存操作时访问：

- 当前活动标签页的标题、网址和网站图标，用于显示当前页面并创建书签。
- Chrome 书签文件夹和书签条目，用于展示目录树、创建书签或移动已存在的相同网址书签。
- 用户选择的保存位置和语言偏好，这些设置保存在 `chrome.storage.local` 中。

### 数据收集与传输

扩展不会将当前页面、书签或设置数据发送给开发者或任何第三方服务器。扩展没有外部网络接口、分析 SDK、广告 SDK 或远程代码。

扩展不会出售、出租、共享或以其他方式披露用户数据，也不会将数据用于广告、画像、信用评估或与书签管理无关的用途。

### 数据存储与删除

书签由 Chrome Bookmarks API 管理，并遵循用户自己的 Chrome 同步设置。语言和保存位置偏好仅存储在 Chrome 本地扩展存储中。

用户可以通过 Chrome 书签管理器删除或修改书签。卸载扩展会由 Chrome 清除扩展的本地存储数据。

### 权限用途

- `bookmarks`：读取书签树，并根据用户操作创建或移动书签。
- `activeTab`：仅在用户点击扩展按钮后临时读取当前活动标签页的标题、网址和网站图标。
- `storage`：在本地保存书签位置和语言偏好。

### 政策变更

如果扩展的数据处理方式发生变化，本政策会在发布新版本前更新，并修改生效日期。

### 联系方式

问题或隐私请求请提交到：

https://github.com/baizixv/chrome-extension-bookmark/issues

---

## English

Bookmark Quick Save is a bookmark management extension that runs locally in Chrome. This policy explains what data the extension accesses and how that data is used.

### Data accessed by the extension

The extension accesses the following data only when the user opens the extension or performs a save action:

- The active tab title, URL, and favicon, used to display the current page and create a bookmark.
- Chrome bookmark folders and bookmark entries, used to display the bookmark tree, create bookmarks, or move an existing bookmark with the same URL.
- The selected save location and language preference, stored in `chrome.storage.local`.

### Data collection and transmission

The extension does not send active-page, bookmark, or preference data to the developer or to any third-party server. It contains no external network endpoint, analytics SDK, advertising SDK, or remote code.

The extension does not sell, rent, share, or otherwise disclose user data. Data is not used for advertising, profiling, credit assessment, or any purpose unrelated to bookmark management.

### Data storage and deletion

Bookmarks are managed through the Chrome Bookmarks API and follow the user's own Chrome synchronization settings. Language and save-location preferences are stored only in Chrome's local extension storage.

Users can delete or modify bookmarks through Chrome's bookmark manager. Uninstalling the extension causes Chrome to remove the extension's local storage data.

### Permission use

- `bookmarks`: Reads the bookmark tree and creates or moves bookmarks following explicit user actions.
- `activeTab`: Temporarily reads the active tab title, URL, and favicon only after the user invokes the extension action.
- `storage`: Saves the bookmark location and language preference locally.

### Policy changes

If the extension's data practices change, this policy will be updated before a new version is released, and the effective date will be revised.

### Contact

For questions or privacy requests, open an issue at:

https://github.com/baizixv/chrome-extension-bookmark/issues
