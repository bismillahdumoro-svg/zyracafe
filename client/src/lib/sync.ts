// Full database sync service - download all data untuk offline-first
import { initDB, saveToIndexedDB, getFromIndexedDB } from "./db";

const SYNC_INTERVAL = 5 * 60 * 1000; // Sync every 5 minutes
let syncTimer: NodeJS.Timeout | null = null;

interface SyncStatus {
  lastSync: string;
  synced: boolean;
  totalRecords: number;
}

export async function fullDatabaseSync() {
  try {
    console.log("[Sync] Starting full database sync...");

    const endpoints = [
      { store: "products", url: "/api/products" },
      { store: "categories", url: "/api/categories" },
      { store: "billiardTables", url: "/api/billiard-tables" },
      { store: "billiardRentals", url: "/api/billiard-rentals/active" },
    ];

    let totalRecords = 0;

    for (const { store, url } of endpoints) {
      try {
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            await saveToIndexedDB(store, data);
            totalRecords += data.length;
            console.log(`[Sync] Downloaded ${data.length} records to ${store}`);
          }
        }
      } catch (error) {
        console.warn(`[Sync] Failed to sync ${store}:`, error);
      }
    }

    // Save sync metadata
    const metadata: SyncStatus = {
      lastSync: new Date().toISOString(),
      synced: true,
      totalRecords,
    };
    await saveToIndexedDB("metadata", metadata);

    console.log(`[Sync] Full sync complete - ${totalRecords} records downloaded`);
    return true;
  } catch (error) {
    console.error("[Sync] Error during sync:", error);
    return false;
  }
}

export async function startAutoSync() {
  // Initial sync on app load
  await fullDatabaseSync();

  // Then sync periodically
  syncTimer = setInterval(async () => {
    console.log("[Sync] Running scheduled sync...");
    await fullDatabaseSync();
  }, SYNC_INTERVAL);

  console.log("[Sync] Auto-sync started - will sync every 5 minutes");
}

export async function stopAutoSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log("[Sync] Auto-sync stopped");
  }
}

export async function syncOnlineChanges() {
  // Sync any changes made while offline
  try {
    const db = await initDB();
    const tx = db.transaction("offlineQueue", "readonly");
    const store = tx.objectStore("offlineQueue");

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = async () => {
        const queue = request.result as any[];
        if (queue.length === 0) {
          resolve(true);
          return;
        }

        console.log(`[Sync] Processing ${queue.length} offline changes...`);
        let synced = 0;

        for (const item of queue) {
          try {
            const response = await fetch(item.url, {
              method: item.method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });

            if (response.ok) {
              synced++;
              // Remove from queue
              const delTx = db.transaction("offlineQueue", "readwrite");
              const delStore = delTx.objectStore("offlineQueue");
              delStore.delete(item.id);
            }
          } catch (error) {
            console.warn("[Sync] Failed to sync change:", error);
          }
        }

        console.log(`[Sync] Synced ${synced}/${queue.length} offline changes`);
        resolve(true);
      };
    });
  } catch (error) {
    console.error("[Sync] Error syncing changes:", error);
    return false;
  }
}

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", async () => {
    console.log("[Sync] Connection restored - syncing changes...");
    await syncOnlineChanges();
    await fullDatabaseSync();
  });

  window.addEventListener("offline", () => {
    console.log("[Sync] Connection lost - app will work offline");
  });
}
