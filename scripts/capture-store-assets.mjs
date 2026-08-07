import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import console from "node:console";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

/* global fetch, WebSocket */

const root = process.cwd();
const port = 4174;
const debuggingPort = 9334;
const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = fs.mkdtempSync(
  path.join(os.tmpdir(), "bookmark-store-capture-"),
);

if (!fs.existsSync(chromePath)) {
  throw new Error(
    "Chrome was not found. Set CHROME_PATH to the browser executable.",
  );
}

fs.mkdirSync(path.join(root, "store-assets/screenshots"), { recursive: true });
fs.mkdirSync(path.join(root, "store-assets/promo"), { recursive: true });

const vite = spawn(
  process.execPath,
  [
    path.join(root, "node_modules/vite/bin/vite.js"),
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { cwd: root, stdio: "ignore" },
);
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${debuggingPort}`,
    `http://127.0.0.1:${port}/store-preview.html?lang=zh-CN&mode=screenshot`,
  ],
  { cwd: root, stdio: "ignore" },
);

async function stopProcess(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  for (let attempt = 0; attempt < 20 && child.exitCode === null; attempt += 1) {
    await delay(100);
  }
  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await delay(200);
  }
}

async function cleanup() {
  await Promise.all([stopProcess(chrome), stopProcess(vite)]);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(profile, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await delay(200);
    }
  }
}

async function waitForTargets() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(
        `http://127.0.0.1:${debuggingPort}/json/list`,
      );
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await delay(300);
  }
  throw new Error("Timed out waiting for Chrome DevTools Protocol.");
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let requestId = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const resolve = pending.get(message.id);
    if (resolve) {
      resolve(message);
      pending.delete(message.id);
    }
  };
  return new Promise((resolve, reject) => {
    socket.onerror = reject;
    socket.onopen = () => {
      resolve({
        call(method, params = {}) {
          return new Promise((callResolve) => {
            const id = ++requestId;
            pending.set(id, callResolve);
            socket.send(JSON.stringify({ id, method, params }));
          });
        },
        close: () => socket.close(),
      });
    };
  });
}

const captures = [
  {
    language: "zh-CN",
    mode: "screenshot",
    width: 1280,
    height: 800,
    output: "store-assets/screenshots/screenshot-zh-CN-1280x800.png",
  },
  {
    language: "en",
    mode: "screenshot",
    width: 1280,
    height: 800,
    output: "store-assets/screenshots/screenshot-en-1280x800.png",
  },
  {
    language: "zh-CN",
    mode: "promo",
    width: 440,
    height: 280,
    output: "store-assets/promo/small-promo-440x280.png",
  },
];

try {
  const targets = await waitForTargets();
  const target = targets.find(
    (item) => item.type === "page" && item.url.includes("store-preview.html"),
  );
  if (!target) throw new Error("Store preview target was not found.");
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.call("Page.enable");

  for (const capture of captures) {
    await cdp.call("Emulation.setDeviceMetricsOverride", {
      width: capture.width,
      height: capture.height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.call("Page.navigate", {
      url: `http://127.0.0.1:${port}/store-preview.html?lang=${capture.language}&mode=${capture.mode}`,
    });
    await delay(1800);
    const response = await cdp.call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const data = response.result?.data;
    if (!data) throw new Error(`Screenshot capture failed: ${capture.output}`);
    fs.writeFileSync(
      path.join(root, capture.output),
      Buffer.from(data, "base64"),
    );
    console.log(`Created ${capture.output}`);
  }

  cdp.close();
} finally {
  await cleanup();
}
