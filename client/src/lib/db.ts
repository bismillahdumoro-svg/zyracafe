// IndexedDB untuk offline-first data persistence
const DB_NAME = "POS_Billiard_DB";
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;

export async function initDB() {
  if (dbInstance) return dbInstance;

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Main Data Stores (synced from server)
      const stores = [
        { name: "users", keyPath: "id" },
        { name: "categories", keyPath: "id" },
        { name: "products", keyPath: "id" },
        { name: "shifts", keyPath: "id" },
        { name: "transactions", keyPath: "id" },
        { name: "transactionItems", keyPath: "id" },
        { name: "billiardRentals", keyPath: "id" },
        { name: "billiardTables", keyPath: "id" },
        { name: "stockAdjustments", keyPath: "id" },
        { name: "expenses", keyPath: "id" },
        { name: "loans", keyPath: "id" },
      ];

      stores.forEach(({ name, keyPath }) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath });
          // Add indexes untuk common queries
          if (name === "products") store.createIndex("categoryId", "categoryId", { unique: false });
          if (name === "transactions") store.createIndex("shiftId", "shiftId", { unique: false });
          if (name === "billiardRentals") store.createIndex("tableNumber", "tableNumber", { unique: false });
        }
      });

      // Metadata & Sync Queue
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("offlineQueue")) {
        db.createObjectStore("offlineQueue", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("cartItems")) {
        db.createObjectStore("cartItems", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export async function saveToIndexedDB(storeName: string, data: any) {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("IndexedDB save error:", error);
  }
}

export async function getFromIndexedDB(storeName: string, key?: string) {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = key ? store.get(key) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB get error:", error);
    return null;
  }
}

export async function deleteFromIndexedDB(storeName: string, key: string) {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB delete error:", error);
  }
}

export async function clearIndexedDB(storeName: string) {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB clear error:", error);
  }
}
