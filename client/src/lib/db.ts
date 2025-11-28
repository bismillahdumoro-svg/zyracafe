// IndexedDB untuk offline data persistence
const DB_NAME = "POS_Billiard_DB";
const DB_VERSION = 1;

export async function initDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Billiard Rentals Store
      if (!db.objectStoreNames.contains("billiardRentals")) {
        const store = db.createObjectStore("billiardRentals", { keyPath: "id" });
        store.createIndex("tableNumber", "tableNumber", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      // Transactions Queue (untuk sync saat online)
      if (!db.objectStoreNames.contains("transactionsQueue")) {
        db.createObjectStore("transactionsQueue", { keyPath: "id", autoIncrement: true });
      }

      // Cart Items
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
