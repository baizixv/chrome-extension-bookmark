import { Globe2 } from "lucide-react";
import { useState } from "react";
import type { ActivePage } from "../domain/types";
import type { Messages } from "../i18n";
import styles from "./CurrentPage.module.css";

interface CurrentPageProps {
  page: ActivePage | null;
  loading: boolean;
  messages: Messages;
}

export function CurrentPage({ page, loading, messages }: CurrentPageProps) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const faviconUrl = page?.favIconUrl;
  const showFavicon = Boolean(faviconUrl?.startsWith("http")) && !faviconFailed;
  const title = loading
    ? messages.loadingPage
    : page
      ? page.title || messages.unnamedPage
      : messages.noPage;
  const url = loading ? messages.wait : page?.url || messages.switchPage;

  return (
    <section className={styles.preview} aria-label={messages.currentPage}>
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
