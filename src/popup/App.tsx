import { BookmarkCheck, List, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookmarkLocationTree } from "../components/BookmarkLocationTree";
import { CurrentPage } from "../components/CurrentPage";
import {
  flattenFolders,
  getDefaultLocation,
  getLocationSummary,
  indexBookmarks,
  isBookmarksBar,
  validateLocation,
} from "../domain/bookmark-tree";
import {
  findDuplicate,
  getMoveIndex,
  resolvePosition,
  withResolvedTarget,
} from "../domain/bookmark-position";
import type {
  ActivePage,
  BookmarkLocation,
  BookmarkNode,
} from "../domain/types";
import {
  createPageBookmark,
  getBookmarkTree,
  getFolderChildren,
  moveBookmark,
} from "../services/bookmarks";
import { loadSettings, saveSettings } from "../services/storage";
import { getActivePage, openBookmarkManager } from "../services/tabs";
import styles from "./App.module.css";

interface Status {
  message: string;
  type: "success" | "error" | "";
}

const EMPTY_LOCATION: BookmarkLocation = {
  folderId: "",
  target: { type: "top" },
};

function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Invalid URL")
    ? "此页面类型不支持收藏为书签"
    : "保存失败，请确认目标位置仍然存在";
}

export function App() {
  const [page, setPage] = useState<ActivePage | null>(null);
  const [root, setRoot] = useState<BookmarkNode | null>(null);
  const [location, setLocation] = useState<BookmarkLocation>(EMPTY_LOCATION);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ message: "", type: "" });

  const folders = useMemo(() => (root ? flattenFolders(root) : []), [root]);
  const references = useMemo(
    () => (root ? indexBookmarks(root) : new Map()),
    [root],
  );
  const summary = useMemo(
    () => getLocationSummary(folders, references, location),
    [folders, references, location],
  );

  const initialize = useCallback(async () => {
    setLoading(true);
    setStatus({ message: "", type: "" });
    try {
      const [activePage, tree, storedSettings] = await Promise.all([
        getActivePage(),
        getBookmarkTree(),
        loadSettings(),
      ]);
      const nextRoot = tree[0];
      if (!nextRoot) throw new Error("Bookmark tree is unavailable");
      const nextLocation = validateLocation(
        nextRoot,
        storedSettings.location.folderId
          ? storedSettings.location
          : getDefaultLocation(nextRoot),
      );
      const bookmarksBar = (nextRoot.children || []).find(isBookmarksBar);
      setPage(activePage);
      setRoot(nextRoot);
      setLocation(nextLocation);
      setExpandedFolderIds(new Set(bookmarksBar ? [bookmarksBar.id] : []));
      await saveSettings({ location: nextLocation });
    } catch (error) {
      console.error(error);
      setStatus({ message: "读取书签失败，请刷新后重试", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const handleSelect = useCallback((nextLocation: BookmarkLocation) => {
    setLocation(nextLocation);
    setStatus({ message: "", type: "" });
    void saveSettings({ location: nextLocation }).catch((error) => {
      console.error(error);
      setStatus({ message: "保存位置设置失败", type: "error" });
    });
  }, []);

  const handleToggle = useCallback((folderId: string) => {
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!page?.url || !location.folderId) {
      setStatus({ message: "当前页面或目标文件夹不可用", type: "error" });
      return;
    }

    setSaving(true);
    setStatus({ message: "", type: "" });
    try {
      const children = await getFolderChildren(location.folderId);
      const position = resolvePosition(children, location.target);
      const resolvedLocation = withResolvedTarget(location, position);
      const duplicate = findDuplicate(children, page.url);

      if (duplicate) {
        const existingIndex = children.indexOf(duplicate);
        const moveIndex = getMoveIndex(
          position,
          existingIndex,
          children.length,
          duplicate.id,
        );
        if (moveIndex !== existingIndex) {
          await moveBookmark(duplicate.id, location.folderId, moveIndex);
          setStatus({ message: "已将已有书签移动到新位置", type: "success" });
        } else {
          setStatus({ message: "这个书签已经在指定位置", type: "success" });
        }
      } else {
        await createPageBookmark(location.folderId, position.index, page);
        const folder = folders.find((item) => item.id === location.folderId);
        setStatus({
          message: `已保存到「${folder?.path || "目标文件夹"}」`,
          type: "success",
        });
      }

      setLocation(resolvedLocation);
      await saveSettings({ location: resolvedLocation });
      const [nextRoot] = await getBookmarkTree();
      if (nextRoot) setRoot(nextRoot);
    } catch (error) {
      console.error(error);
      setStatus({ message: getErrorMessage(error), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    Boolean(page?.url && location.folderId) && !loading && !saving;

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brandLockup}>
          <div className={styles.brandMark} aria-hidden="true">
            <BookmarkCheck size={21} strokeWidth={1.9} />
          </div>
          <div>
            <h1>书签快存</h1>
            <p>保存此刻，稍后继续</p>
          </div>
        </div>
        <button
          className={styles.iconButton}
          type="button"
          aria-label="刷新书签文件夹"
          title="刷新书签文件夹"
          onClick={() => void initialize()}
          disabled={loading}
        >
          <RefreshCw size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      <CurrentPage page={page} loading={loading} />

      <section className={styles.locationSection}>
        <div className={styles.fieldLabelRow}>
          <label>保存位置</label>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => void openBookmarkManager()}
          >
            <List size={14} strokeWidth={1.8} aria-hidden="true" />
            打开书签管理器
          </button>
        </div>
        <BookmarkLocationTree
          root={root}
          location={location}
          summary={loading ? "正在读取..." : summary}
          expandedFolderIds={expandedFolderIds}
          onSelect={handleSelect}
          onToggle={handleToggle}
        />
      </section>

      <button
        className={styles.saveButton}
        type="button"
        disabled={!canSave}
        onClick={() => void handleSave()}
      >
        <Save size={17} strokeWidth={2} aria-hidden="true" />
        <span>{saving ? "正在保存..." : "保存到书签"}</span>
      </button>
      <p
        className={`${styles.status} ${status.type === "error" ? styles.error : ""}`}
        role="status"
        aria-live="polite"
      >
        {status.message}
      </p>
    </main>
  );
}
