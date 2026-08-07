import { Globe2 } from "lucide-react";
import { useState } from "react";
import type { ActivePage } from "../domain/types";
import styles from "./CurrentPage.module.css";

interface CurrentPageProps {
  page: ActivePage | null;
  loading: boolean;
}

export function CurrentPage({ page, loading }: CurrentPageProps) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const faviconUrl = page?.favIconUrl;
  const showFavicon = Boolean(faviconUrl?.startsWith("http")) && !faviconFailed;
  const title = loading
    ? "正在读取当前页面..."
    : page?.title || "没有可用的当前页面";
  const url = loading ? "请稍候" : page?.url || "请切换到普通网页后重试";

  return (
    <section className={styles.preview} aria-label="当前页面">
      <div className={styles.favicon} aria-hidden="true">
        {showFavicon ? (
          <img src={faviconUrl} alt="" onError={() => setFaviconFailed(true)} />
        ) : (
          <Globe2 size={19} strokeWidth={1.8} />
        )}
      </div>
      <div className={styles.copy}>
        <strong title={title}>{title}</strong>
        <span title={url}>{url}</span>
      </div>
    </section>
  );
}
