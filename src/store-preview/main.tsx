import { BookmarkCheck } from "lucide-react";
import { createRoot } from "react-dom/client";
import { App } from "../popup/App";
import { installMockChrome } from "./mock-chrome";
import "../styles/global.css";
import "./preview.css";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "promo" ? "promo" : "screenshot";
const language = params.get("lang") === "en" ? "en" : "zh-CN";
installMockChrome(language);

const copy =
  language === "zh-CN"
    ? {
        name: "书签快存",
        headline: "每个书签，都放在正好的位置",
        support: "选择文件夹、指定顺序、重复网址自动归位。",
        badge: "Chrome 书签效率工具",
      }
    : {
        name: "Bookmark Quick Save",
        headline: "Put every bookmark exactly where it belongs",
        support:
          "Choose a folder, set the order, and move duplicates automatically.",
        badge: "A focused Chrome bookmark tool",
      };

export function Preview() {
  return (
    <main className={`storeCanvas ${mode}`}>
      <section className="storeCopy">
        <div className="storeBrand">
          <span className="storeIcon">
            <BookmarkCheck size={30} strokeWidth={1.9} />
          </span>
          <strong>{copy.name}</strong>
        </div>
        <p className="storeBadge">{copy.badge}</p>
        <h1>{copy.headline}</h1>
        <p className="storeSupport">{copy.support}</p>
      </section>
      <section className="productStage" aria-label={copy.name}>
        <div className="browserBar">
          <span className="browserDot coral" />
          <span className="browserDot gold" />
          <span className="browserDot teal" />
          <span className="browserTitle">Chrome</span>
        </div>
        <div className="popupSurface">
          <App />
        </div>
      </section>
    </main>
  );
}

const root = document.querySelector("#store-preview-root");
if (!root) throw new Error("Store preview root was not found");
createRoot(root).render(<Preview />);
