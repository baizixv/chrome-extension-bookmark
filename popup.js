const DEFAULTS = {
  folderId: "",
  targetId: "top",
};

const elements = {
  form: document.querySelector("#bookmark-form"),
  pageTitle: document.querySelector("#page-title"),
  pageUrl: document.querySelector("#page-url"),
  favicon: document.querySelector("#site-favicon"),
  locationTree: document.querySelector("#location-tree"),
  locationSummary: document.querySelector("#location-summary"),
  treeEmpty: document.querySelector("#tree-empty"),
  saveButton: document.querySelector("#save-button"),
  saveButtonText: document.querySelector("#save-button span"),
  status: document.querySelector("#status"),
  refreshButton: document.querySelector("#refresh-button"),
  openManager: document.querySelector("#open-manager"),
};

let activeTab = null;
let folders = [];
let settings = { ...DEFAULTS };
const expandedFolderIds = new Set();
const bookmarkLocations = new Map();

function setStatus(message, type = "") {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`.trim();
}

function getFolderTitle(node) {
  const labels = {
    "Bookmarks bar": "书签栏",
    "Other bookmarks": "其他书签",
    "Mobile bookmarks": "移动书签",
  };
  return labels[node.title] || node.title || "未命名文件夹";
}

function isBookmarksBar(node) {
  const normalizedTitle = (node.title || "").trim().toLowerCase();
  return node.id === "1" || normalizedTitle === "bookmarks bar" || normalizedTitle === "书签栏";
}

function flattenFolders(node, parentPath = []) {
  const result = [];
  if (node.url === undefined && node.id !== "0") {
    const title = getFolderTitle(node);
    const path = [...parentPath, title];
    result.push({ id: node.id, title, path: path.join(" / ") });
    for (const child of node.children || []) {
      result.push(...flattenFolders(child, path));
    }
  } else {
    for (const child of node.children || []) {
      result.push(...flattenFolders(child, parentPath));
    }
  }
  return result;
}

function findNode(node, id) {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const match = findNode(child, id);
    if (match) return match;
  }
  return null;
}

function indexBookmarkLocations(node) {
  if (node.url !== undefined) return;
  for (const child of node.children || []) {
    if (child.url) {
      bookmarkLocations.set(child.id, {
        folderId: node.id,
        title: child.title || "未命名书签",
      });
    } else {
      indexBookmarkLocations(child);
    }
  }
}

function createFolderIcon() {
  const icon = document.createElement("span");
  icon.className = "folder-node-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h5l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" /><path d="M3.5 9h17" /></svg>';
  return icon;
}

function createMarker(type) {
  if (type === "folder") return createFolderIcon();
  const marker = document.createElement("span");
  marker.className = `position-marker ${type === "bookmark" ? "entry-marker bookmark-marker" : "line-marker"}`;
  marker.setAttribute("aria-hidden", "true");
  return marker;
}

function createLocationOption({ folderId, targetId, title, detail, type }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "position-option location-option";
  button.dataset.folderId = folderId;
  button.dataset.targetId = targetId;
  button.setAttribute("role", "treeitem");
  button.append(createMarker(type));

  const copy = document.createElement("span");
  copy.className = "position-option-copy";
  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  const detailElement = document.createElement("small");
  detailElement.textContent = detail;
  copy.append(titleElement, detailElement);
  button.append(copy);

  const check = document.createElement("span");
  check.className = "position-check";
  check.textContent = "✓";
  check.setAttribute("aria-hidden", "true");
  button.append(check);

  button.addEventListener("click", () => selectLocation(folderId, targetId));
  return button;
}

function createTreeRow(option, withToggle = false) {
  const row = document.createElement("div");
  row.className = "location-tree-row";
  if (!withToggle) {
    const spacer = document.createElement("span");
    spacer.className = "folder-toggle-spacer";
    spacer.setAttribute("aria-hidden", "true");
    row.append(spacer);
  }
  row.append(option);
  return row;
}

function createBookmarkNode(node, parentId, parentList) {
  const listItem = document.createElement("li");
  listItem.className = "location-tree-node";
  listItem.setAttribute("role", "none");
  const option = createLocationOption({
    folderId: parentId,
    targetId: node.id,
    title: node.title || "未命名书签",
    detail: "插入到此书签之前",
    type: "bookmark",
  });
  listItem.append(createTreeRow(option));
  parentList.append(listItem);
}

function createBottomNode(folderId, parentList) {
  const listItem = document.createElement("li");
  listItem.className = "location-tree-node location-bottom-node";
  listItem.setAttribute("role", "none");
  const option = createLocationOption({
    folderId,
    targetId: "bottom",
    title: "放在此文件夹末尾",
    detail: "排在当前目录最后",
    type: "position",
  });
  listItem.append(createTreeRow(option));
  parentList.append(listItem);
}

function createFolderNode(node, parentList) {
  const children = node.children || [];
  const expanded = children.length > 0 && expandedFolderIds.has(node.id);
  const listItem = document.createElement("li");
  listItem.className = "location-tree-node";
  listItem.setAttribute("role", "none");
  listItem.dataset.folderId = node.id;

  const option = createLocationOption({
    folderId: node.id,
    targetId: "top",
    title: getFolderTitle(node),
    detail: "保存到此文件夹顶部",
    type: "folder",
  });
  const row = document.createElement("div");
  row.className = "location-tree-row";

  if (children.length) {
    const toggle = document.createElement("button");
    toggle.className = "folder-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", `${expanded ? "折叠" : "展开"}${getFolderTitle(node)}`);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>';
    row.append(toggle);

    const childList = document.createElement("ul");
    childList.className = "location-tree-children";
    childList.setAttribute("role", "group");
    childList.hidden = !expanded;
    let childrenRendered = false;
    const renderChildren = () => {
      if (childrenRendered) return;
      for (const child of children) {
        if (child.url === undefined) createFolderNode(child, childList);
        else createBookmarkNode(child, node.id, childList);
      }
      createBottomNode(node.id, childList);
      childrenRendered = true;
      updateLocationSelection();
    };
    if (expanded) renderChildren();

    toggle.addEventListener("click", () => {
      const willExpand = childList.hidden;
      if (willExpand) renderChildren();
      childList.hidden = !willExpand;
      toggle.setAttribute("aria-expanded", String(willExpand));
      toggle.setAttribute("aria-label", `${willExpand ? "折叠" : "展开"}${getFolderTitle(node)}`);
      if (willExpand) expandedFolderIds.add(node.id);
      else expandedFolderIds.delete(node.id);
    });
    listItem.append(row, childList);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "folder-toggle-spacer";
    spacer.setAttribute("aria-hidden", "true");
    row.append(spacer);
    listItem.append(row);
  }

  row.append(option);
  parentList.append(listItem);
}

function getLocationSummary() {
  const folder = folders.find((item) => item.id === settings.folderId);
  if (!folder) return "请选择保存位置";
  if (settings.targetId === "top") return `${folder.path} · 顶部`;
  if (settings.targetId === "bottom") return `${folder.path} · 末尾`;
  const bookmark = bookmarkLocations.get(settings.targetId);
  return bookmark ? `${folder.path} · 在「${bookmark.title}」之前` : `${folder.path} · 顶部`;
}

function updateLocationSelection() {
  elements.locationTree.querySelectorAll(".location-option").forEach((item) => {
    const selected = item.dataset.folderId === settings.folderId
      && item.dataset.targetId === settings.targetId;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-selected", String(selected));
  });
  const summary = getLocationSummary();
  elements.locationSummary.textContent = summary;
  elements.locationSummary.title = summary;
}

async function selectLocation(folderId, targetId) {
  settings.folderId = folderId;
  settings.targetId = targetId;
  updateLocationSelection();
  setStatus("");
  await chrome.storage.local.set(settings);
}

function renderLocationTree(tree, resetExpansion = false) {
  if (resetExpansion) {
    expandedFolderIds.clear();
    const bookmarksBar = (tree[0].children || []).find((node) =>
      node.url === undefined && isBookmarksBar(node)
    );
    if (bookmarksBar) expandedFolderIds.add(bookmarksBar.id);
  }
  folders = flattenFolders(tree[0]);
  bookmarkLocations.clear();
  indexBookmarkLocations(tree[0]);
  elements.locationTree.replaceChildren();

  if (!folders.length) {
    elements.treeEmpty.hidden = false;
    elements.locationSummary.textContent = "没有可用文件夹";
    elements.saveButton.disabled = true;
    return;
  }

  const savedFolderExists = folders.some((folder) => folder.id === settings.folderId);
  if (!savedFolderExists) {
    const bar = folders.find(isBookmarksBar);
    settings.folderId = bar?.id || folders[0].id;
    settings.targetId = "top";
  }

  const selectedFolder = findNode(tree[0], settings.folderId);
  const targetExists = settings.targetId === "top"
    || settings.targetId === "bottom"
    || selectedFolder?.children?.some((child) => child.url && child.id === settings.targetId);
  if (!targetExists) settings.targetId = "top";

  elements.treeEmpty.hidden = true;
  for (const node of tree[0].children || []) {
    if (node.url === undefined) createFolderNode(node, elements.locationTree);
  }
  updateLocationSelection();
}

function renderTab(tab) {
  activeTab = tab;
  if (!tab) {
    elements.pageTitle.textContent = "没有可用的当前页面";
    elements.pageUrl.textContent = "请切换到普通网页后重试";
    return;
  }

  elements.pageTitle.textContent = tab.title || "未命名页面";
  elements.pageUrl.textContent = tab.url || "无法读取页面地址";
  elements.pageTitle.title = tab.title || "未命名页面";
  elements.pageUrl.title = tab.url || "无法读取页面地址";

  if (tab.favIconUrl && /^https?:/i.test(tab.favIconUrl)) {
    const favicon = document.createElement("img");
    favicon.alt = "";
    favicon.src = tab.favIconUrl;
    favicon.addEventListener("error", () => favicon.remove());
    elements.favicon.replaceChildren(favicon);
  }
}

function resolvePosition(children) {
  if (settings.targetId === "bottom") {
    return { index: children.length, targetId: "bottom" };
  }
  if (settings.targetId === "top") return { index: 0, targetId: "top" };

  const targetIndex = children.findIndex((child) => child.url && child.id === settings.targetId);
  if (targetIndex >= 0) return { index: targetIndex, targetId: settings.targetId };
  settings.targetId = "top";
  return { index: 0, targetId: "top" };
}

function getMoveIndex(position, existingIndex, childCount, existingId) {
  if (childCount <= 1) return 0;
  if (position.targetId === "bottom") return childCount - 1;

  const desiredIndex = Math.min(Math.max(position.index, 0), childCount - 1);
  const targetIsAnotherBookmark = position.targetId !== "top" && position.targetId !== existingId;
  if (targetIsAnotherBookmark && existingIndex < desiredIndex) return desiredIndex - 1;
  return desiredIndex;
}

async function reloadTree(resetExpansion = false) {
  const tree = await chrome.bookmarks.getTree();
  renderLocationTree(tree, resetExpansion);
}

async function loadData() {
  elements.saveButton.disabled = true;
  setStatus("");
  try {
    const [tabs, tree, storedSettings] = await Promise.all([
      chrome.tabs.query({ active: true, currentWindow: true }),
      chrome.bookmarks.getTree(),
      chrome.storage.local.get(),
    ]);
    const migratedTarget = typeof storedSettings.targetId === "string"
      ? storedSettings.targetId
      : storedSettings.position === "bottom"
        ? "bottom"
        : storedSettings.position === "custom"
          ? storedSettings.customTargetId || "top"
          : "top";
    settings = {
      folderId: storedSettings.folderId || DEFAULTS.folderId,
      targetId: migratedTarget,
    };
    renderTab(tabs[0]);
    renderLocationTree(tree, true);
    await Promise.all([
      chrome.storage.local.set(settings),
      chrome.storage.local.remove(["position", "customTargetId", "customIndex", "avoidDuplicate"]),
    ]);
    elements.saveButton.disabled = !activeTab || !settings.folderId;
  } catch (error) {
    setStatus("读取书签失败，请刷新后重试", "error");
    console.error(error);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!activeTab?.url || !settings.folderId) {
    setStatus("当前页面或目标文件夹不可用", "error");
    return;
  }

  elements.saveButton.disabled = true;
  elements.saveButtonText.textContent = "正在保存...";
  setStatus("");

  try {
    const children = await chrome.bookmarks.getChildren(settings.folderId);
    const position = resolvePosition(children);
    const duplicate = children.find((bookmark) => bookmark.url === activeTab.url);

    if (duplicate) {
      const existingIndex = children.indexOf(duplicate);
      const moveIndex = getMoveIndex(position, existingIndex, children.length, duplicate.id);
      if (moveIndex !== existingIndex) {
        await chrome.bookmarks.move(duplicate.id, {
          parentId: settings.folderId,
          index: moveIndex,
        });
        setStatus("已将已有书签移动到新位置");
      } else {
        setStatus("这个书签已经在指定位置");
      }
    } else {
      await chrome.bookmarks.create({
        parentId: settings.folderId,
        index: position.index,
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
      });
      const folder = folders.find((item) => item.id === settings.folderId);
      setStatus(`已保存到「${folder?.path || "目标文件夹"}」`);
    }

    await chrome.storage.local.set(settings);
    await reloadTree(false);
  } catch (error) {
    const message = error?.message?.includes("Invalid URL")
      ? "此页面类型不支持收藏为书签"
      : "保存失败，请确认目标位置仍然存在";
    setStatus(message, "error");
    console.error(error);
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButtonText.textContent = "保存到书签";
  }
}

elements.form.addEventListener("submit", handleSubmit);
elements.refreshButton.addEventListener("click", () => loadData());
elements.openManager.addEventListener("click", () => chrome.tabs.create({ url: "chrome://bookmarks/" }));

loadData();
