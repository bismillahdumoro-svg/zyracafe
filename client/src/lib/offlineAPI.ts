// Offline-first API wrapper - read from IndexedDB first, fallback to server
import { getFromIndexedDB, saveToIndexedDB, initDB } from "./db";

interface OfflineQueueItem {
  id?: number;
  method: string;
  url: string;
  data: any;
  timestamp: number;
}

const CACHE_STORES = [
  "products",
  "categories",
  "billiardTables",
  "billiardRentals",
];

export async function getOffline(endpoint: string) {
  // Map endpoints to IndexedDB stores
  const storeMap: Record<string, string> = {
    "/api/products": "products",
    "/api/categories": "categories",
    "/api/billiard-tables": "billiardTables",
    "/api/billiard-rentals/active": "billiardRentals",
  };

  const store = storeMap[endpoint];

  // Try get from IndexedDB first
  if (store) {
    try {
      const cachedData = await getFromIndexedDB(store);
      if (cachedData) {
        console.log(`[OfflineAPI] Returned cached ${store} from IndexedDB`);
        return cachedData;
      }
    } catch (error) {
      console.warn(`[OfflineAPI] Error reading from ${store}:`, error);
    }
  }

  // Fallback to server
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json();
      if (store && Array.isArray(data)) {
        await saveToIndexedDB(store, data);
      }
      return data;
    }
  } catch (error) {
    console.warn("[OfflineAPI] Network error, returning cached data:", error);
    if (store) {
      return getFromIndexedDB(store);
    }
  }

  return null;
}

export async function postOffline(endpoint: string, data: any) {
  try {
    // Try to post to server
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log("[OfflineAPI] Offline - queuing POST request:", endpoint);
    // Queue for later sync
    const item: OfflineQueueItem = {
      method: "POST",
      url: endpoint,
      data,
      timestamp: Date.now(),
    };
    await saveToIndexedDB("offlineQueue", item);
    return { queued: true, data };
  }
}

export async function getSyncStatus() {
  try {
    const metadata = await getFromIndexedDB("metadata") as any;
    return {
      lastSync: metadata?.lastSync || "Never",
      synced: metadata?.synced || false,
      totalRecords: metadata?.totalRecords || 0,
      offlineQueueSize: (await getFromIndexedDB("offlineQueue")) as any[] | null,
    };
  } catch (error) {
    return {
      lastSync: "Error",
      synced: false,
      totalRecords: 0,
      offlineQueueSize: 0,
    };
  }
}
