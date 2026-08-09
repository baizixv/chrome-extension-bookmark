# Bookmark Quick Save

English | [简体中文](README.zh-CN.md)

A Chrome Manifest V3 extension built with React, TypeScript, and Vite. It combines the destination folder and insertion position in a single bookmark tree, allowing you to save the current page with one selection.

## Features

- Automatically reads the active tab's title, URL, and favicon
- Combines folder and insertion-position selection in an always-visible bookmark tree
- Expands the commonly used Bookmarks Bar by default while allowing other folders to be expanded or collapsed as needed
- Click a folder to save at the top, double-click a folder to expand or collapse it, click a bookmark to insert before it, or choose the end of a folder
- Supports system language, Simplified Chinese, and English using standard Chrome manifest localization
- Remembers the complete last-used save location and language preference, with migration support for legacy settings
- Moves an existing bookmark when the same URL is already present in the destination folder
- Opens Chrome's bookmark manager directly

## Development

Requires Node.js 20.19 or later.

```bash
npm install
npm run dev
```

`npm run dev` watches source files and continuously rebuilds `dist/`. Reload the extension from `chrome://extensions/` after making changes.

## Checks and production build

```bash
npm run lint
npm run test
npm run format:check
npm run build
```

The production build is written to `dist/`, including the Chrome-ready `manifest.json`, `popup.html`, and hashed static assets.

## Install in Chrome

1. Run `npm install && npm run build`.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select this project's `dist/` directory.
6. Pin **Bookmark Quick Save** to the toolbar.

## Chrome Web Store publishing

Registration details, store listing copy, permission explanations, privacy-form answers, and the upload checklist are available in:

- [`docs/CHROME_WEB_STORE_PUBLISHING.md`](docs/CHROME_WEB_STORE_PUBLISHING.md)
- [`PRIVACY.md`](PRIVACY.md)

Store icons, screenshots, and promotional images are located in `store-assets/`. Regenerate the screenshots after updating the UI:

```bash
npm run store:capture
```

## Project structure

```text
public/              Manifest, _locales, and other extension assets
src/components/      Popup UI components, settings menu, and recursive bookmark tree
src/domain/          Bookmark tree, position calculations, settings migration, and other pure logic
src/i18n/            Typed Chinese and English UI dictionaries and language resolution
src/popup/           Popup application entry point and workflow orchestration
src/services/        Chrome tabs, bookmarks, and storage API wrappers
src/store-preview/   Store screenshot preview using the real popup UI and mock data
src/styles/          Global styles
store-assets/        Store icons, screenshots, promotional images, and icon source files
tests/               Domain logic and component interaction tests
```
