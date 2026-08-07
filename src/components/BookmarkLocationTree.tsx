import { Bookmark, Check, ChevronDown, Folder, Minus } from "lucide-react";
import type {
  BookmarkLocation,
  BookmarkNode,
  LocationTarget,
} from "../domain/types";
import type { Messages } from "../i18n";
import { getLocalizedFolderTitle } from "../i18n";
import styles from "./BookmarkLocationTree.module.css";

interface BookmarkLocationTreeProps {
  root: BookmarkNode | null;
  location: BookmarkLocation;
  summary: string;
  messages: Messages;
  expandedFolderIds: ReadonlySet<string>;
  onSelect: (location: BookmarkLocation) => void;
  onToggle: (folderId: string) => void;
}

interface LocationOptionProps {
  folderId: string;
  target: LocationTarget;
  title: string;
  detail: string;
  type: "folder" | "bookmark" | "position";
  selected: boolean;
  onSelect: (location: BookmarkLocation) => void;
  onDoubleClick?: () => void;
}

function isSelected(
  location: BookmarkLocation,
  folderId: string,
  target: LocationTarget,
): boolean {
  if (location.folderId !== folderId || location.target.type !== target.type)
    return false;
  return (
    target.type !== "before" ||
    (location.target.type === "before" &&
      location.target.bookmarkId === target.bookmarkId)
  );
}

function LocationOption({
  folderId,
  target,
  title,
  detail,
  type,
  selected,
  onSelect,
  onDoubleClick,
}: LocationOptionProps) {
  const Icon =
    type === "folder" ? Folder : type === "bookmark" ? Bookmark : Minus;
  return (
    <button
      className={`${styles.option} ${selected ? styles.selected : ""}`}
      type="button"
      role="treeitem"
      aria-selected={selected}
      onClick={() => onSelect({ folderId, target })}
      onDoubleClick={onDoubleClick}
    >
      <Icon
        className={`${styles.itemIcon} ${type === "folder" ? styles.folderIcon : ""}`}
        size={17}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <span className={styles.optionCopy}>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <Check
        className={styles.check}
        size={14}
        strokeWidth={2.2}
        aria-hidden="true"
      />
    </button>
  );
}

interface FolderNodeProps {
  node: BookmarkNode;
  location: BookmarkLocation;
  messages: Messages;
  expandedFolderIds: ReadonlySet<string>;
  onSelect: (location: BookmarkLocation) => void;
  onToggle: (folderId: string) => void;
}

function FolderNode({
  node,
  location,
  messages,
  expandedFolderIds,
  onSelect,
  onToggle,
}: FolderNodeProps) {
  const children = node.children || [];
  const expanded = children.length > 0 && expandedFolderIds.has(node.id);
  const topTarget: LocationTarget = { type: "top" };
  const folderTitle = getLocalizedFolderTitle(node, messages);

  return (
    <li className={styles.node} role="none">
      <div className={styles.row}>
        {children.length ? (
          <button
            className={styles.toggle}
            type="button"
            aria-label={
              expanded
                ? messages.collapseFolder(folderTitle)
                : messages.expandFolder(folderTitle)
            }
            aria-expanded={expanded}
            onClick={() => onToggle(node.id)}
          >
            <ChevronDown
              className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ""}`}
              size={14}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className={styles.toggleSpacer} aria-hidden="true" />
        )}
        <LocationOption
          folderId={node.id}
          target={topTarget}
          title={folderTitle}
          detail={messages.saveFolderTop}
          type="folder"
          selected={isSelected(location, node.id, topTarget)}
          onSelect={onSelect}
          onDoubleClick={children.length ? () => onToggle(node.id) : undefined}
        />
      </div>

      {expanded && (
        <ul className={styles.children} role="group">
          {children.map((child) =>
            child.url ? (
              <li className={styles.node} role="none" key={child.id}>
                <div className={styles.row}>
                  <span className={styles.toggleSpacer} aria-hidden="true" />
                  <LocationOption
                    folderId={node.id}
                    target={{ type: "before", bookmarkId: child.id }}
                    title={child.title || messages.unnamedBookmark}
                    detail={messages.insertBefore}
                    type="bookmark"
                    selected={isSelected(location, node.id, {
                      type: "before",
                      bookmarkId: child.id,
                    })}
                    onSelect={onSelect}
                  />
                </div>
              </li>
            ) : (
              <FolderNode
                key={child.id}
                node={child}
                location={location}
                messages={messages}
                expandedFolderIds={expandedFolderIds}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ),
          )}
          <li className={`${styles.node} ${styles.bottomNode}`} role="none">
            <div className={styles.row}>
              <span className={styles.toggleSpacer} aria-hidden="true" />
              <LocationOption
                folderId={node.id}
                target={{ type: "bottom" }}
                title={messages.placeAtFolderEnd}
                detail={messages.folderEndDetail}
                type="position"
                selected={isSelected(location, node.id, { type: "bottom" })}
                onSelect={onSelect}
              />
            </div>
          </li>
        </ul>
      )}
    </li>
  );
}

export function BookmarkLocationTree({
  root,
  location,
  summary,
  messages,
  expandedFolderIds,
  onSelect,
  onToggle,
}: BookmarkLocationTreeProps) {
  const rootFolders = (root?.children || []).filter((node) => !node.url);
  return (
    <>
      <div className={styles.summary} title={summary}>
        {summary}
      </div>
      <div className={styles.picker}>
        <div className={styles.heading}>{messages.locationHeading}</div>
        {rootFolders.length ? (
          <ul
            className={styles.tree}
            role="tree"
            aria-label={messages.saveLocation}
          >
            {rootFolders.map((node) => (
              <FolderNode
                key={node.id}
                node={node}
                location={location}
                messages={messages}
                expandedFolderIds={expandedFolderIds}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{messages.noFolders}</p>
        )}
      </div>
    </>
  );
}
