import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDB } from "./lib/db";

// Initialize IndexedDB
initDB().then(() => {
  console.log("IndexedDB initialized");
}).catch((error) => {
  console.warn("IndexedDB initialization failed:", error);
});

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
