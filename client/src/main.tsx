import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDB } from "./lib/db";
import { startKeepAlive } from "./lib/keepalive";
import { startAutoSync } from "./lib/sync";

// Initialize IndexedDB
initDB().then(() => {
  console.log("IndexedDB initialized");
}).catch((error) => {
  console.warn("IndexedDB initialization failed:", error);
});

// Start full database sync untuk offline-first app
startAutoSync().catch((error) => {
  console.warn("Database sync failed:", error);
});

// Start keep-alive untuk prevent Replit temporary URL idle timeout
startKeepAlive();

// Register Service Worker untuk offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js?t=" + new Date().getTime())
      .then((registration) => {
        console.log("Service Worker terdaftar:", registration);
      })
      .catch((error) => {
        console.warn("Service Worker gagal terdaftar:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
