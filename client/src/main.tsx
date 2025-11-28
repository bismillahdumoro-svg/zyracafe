import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker untuk offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker terdaftar:", registration);
      })
      .catch((error) => {
        console.warn("Service Worker gagal terdaftar:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
