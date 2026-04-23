const DB_NAME = "TelemetryDB";
const STORE_NAME = "offline_packets";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueuePacket(packet) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      
      // Keep queue size limited to 1000 items (avoid memory/storage issues)
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result >= 1000) {
          // Open a cursor to delete the oldest
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              cursor.delete();
            }
          };
        }
      };

      store.add(packet);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Failed to enqueue packet:", error);
  }
}

export async function flushQueue() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const packets = request.result;
        if (packets.length > 0) {
          store.clear();
        }
        resolve(packets);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to flush queue:", error);
    return [];
  }
}
