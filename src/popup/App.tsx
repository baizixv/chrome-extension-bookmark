import { BookmarkCheck, List, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookmarkLocationTree } from "../components/BookmarkLocationTree";
import { CurrentPage } from "../components/CurrentPage";
import { SettingsMenu } from "../components/SettingsMenu";
import {
  flattenFolders,
  getDefaultLocation,
  getLocationDescription,
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
  LanguagePreference,
} from "../domain/types";
import {
  formatLocationSummary,
  getLocalizedFolderTitle,
  getMessages,
  resolveLanguage,
} from "../i18n";
import {
  createPageBookmark,
  getBookmarkTree,
  getFolderChildren,
  moveBookmark,
} from "../services/bookmarks";
import { loadSettings, saveSettings } from "../services/storage";
import {
  getActivePage,
  getSystemLanguage,
  openBookmarkManager,
  closePopup,
} from "../services/tabs";
import styles from "./App.module.css";

const EMPTY_LOCATION: BookmarkLocation = {
  folderId: "",
  target: { type: "top" },
};

type StatusKey =
  | ""
  | "readFailed"
  | "locationSaveFailed"
  | "pageUnavailable"
  | "invalidUrl"
  | "saveFailed";

interface Status {
  key: StatusKey;
  type: "error" | "";
}

function getErrorStatusKey(error: unknown): StatusKey {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Invalid URL") ? "invalidUrl" : "saveFailed";
}

export function App() {
  const [page, setPage] = useState<ActivePage | null>(null);
  const [root, setRoot] = useState<BookmarkNode | null>(null);
  const [location, setLocation] = useState<BookmarkLocation>(EMPTY_LOCATION);
  const [language, setLanguage] = useState<LanguagePreference>("system");
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ key: "", type: "" });

  const systemLanguage = useMemo(getSystemLanguage, []);
  const uiLanguage = resolveLanguage(language, systemLanguage);
  const messages = getMessages(uiLanguage);
  const folders = useMemo(
    () =>
      root
        ? flattenFolders(root, [], (node) =>
            getLocalizedFolderTitle(node, messages),
          )
        : [],
    [messages, root],
  );
  const references = useMemo(
    () => (root ? indexBookmarks(root) : new Map()),
    [root],
  );
  const summary = useMemo(
    () =>
      formatLocationSummary(
        getLocationDescription(folders, references, location),
        messages,
      ),
    [folders, location, messages, references],
  );
  const statusMessage = useMemo(() => {
    if (!status.key) return "";
    return messages[status.key];
  }, [messages, status]);

  const initialize = useCallback(async () => {
    setLoading(true);
    setStatus({ key: "", type: "" });
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
      setLanguage(storedSettings.language);
      setExpandedFolderIds(new Set(bookmarksBar ? [bookmarksBar.id] : []));
      await saveSettings({
        location: nextLocation,
        language: storedSettings.language,
      });
    } catch (error) {
      console.error(error);
      setStatus({ key: "readFailed", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const handleSelect = useCallback(
    (nextLocation: BookmarkLocation) => {
      setLocation(nextLocation);
      setStatus({ key: "", type: "" });
      void saveSettings({ location: nextLocation, language }).catch((error) => {
        console.error(error);
        setStatus({ key: "locationSaveFailed", type: "error" });
      });
    },
    [language],
  );

  const handleLanguageChange = useCallback(
    (nextLanguage: LanguagePreference) => {
      setLanguage(nextLanguage);
      setStatus({ key: "", type: "" });
      void saveSettings({ location, language: nextLanguage }).catch((error) => {
        console.error(error);
        setStatus({ key: "locationSaveFailed", type: "error" });
      });
    },
    [location],
  );

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
      setStatus({ key: "pageUnavailable", type: "error" });
      return;
    }

    setSaving(true);
    setStatus({ key: "", type: "" });
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
        }
      } else {
        await createPageBookmark(location.folderId, position.index, page);
      }

      setLocation(resolvedLocation);
      await saveSettings({ location: resolvedLocation, language });
      const [nextRoot] = await getBookmarkTree();
      if (nextRoot) setRoot(nextRoot);
      closePopup();
    } catch (error) {
      console.error(error);
      setStatus({ key: getErrorStatusKey(error), type: "error" });
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
            <h1>{messages.brandName}</h1>
            <p>{messages.tagline}</p>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <SettingsMenu
            language={language}
            messages={messages}
            onLanguageChange={handleLanguageChange}
          />
          <button
            className={styles.iconButton}
            type="button"
            aria-label={messages.refresh}
            title={messages.refresh}
            onClick={() => void initialize()}
            disabled={loading}
          >
            <RefreshCw size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </header>

      <CurrentPage page={page} loading={loading} messages={messages} />

      <section className={styles.locationSection}>
        <div className={styles.fieldLabelRow}>
          <label>{messages.saveLocation}</label>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => void openBookmarkManager()}
          >
            <List size={14} strokeWidth={1.8} aria-hidden="true" />
            {messages.openManager}
          </button>
        </div>
        <BookmarkLocationTree
          root={root}
          location={location}
          summary={loading ? messages.loading : summary}
          messages={messages}
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
        <span>{saving ? messages.saving : messages.save}</span>
      </button>
      <p
        className={`${styles.status} ${status.type === "error" ? styles.error : ""}`}
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </main>
  );
}
