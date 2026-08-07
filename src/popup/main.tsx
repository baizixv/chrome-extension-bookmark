import { createRoot } from "react-dom/client";
import { App } from "./App";
import "../styles/global.css";

const root = document.querySelector("#root");
if (!root) throw new Error("Popup root element was not found");

createRoot(root).render(<App />);
