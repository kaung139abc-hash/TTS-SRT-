// Robust IndexedDB History Storage for Unlimited Audio Blobs (Bypasses 5MB localStorage limit)

export interface StoredHistoryItem {
  id: string;
  type: 'tts' | 'story' | 'dialogue';
  title: string;
  content: string;
  voiceName?: string;
  bgmName?: string;
  audioUrl?: string;
  characterCount: number;
  timestamp: number;
}

const DB_NAME = 'VoiceMasterHistoryDB';
const STORE_NAME = 'history_records';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllHistory(): Promise<StoredHistoryItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result as StoredHistoryItem[]) || [];
        // Sort newest first, keep top 5
        items.sort((a, b) => b.timestamp - a.timestamp);
        resolve(items.slice(0, 5));
      };
      request.onerror = () => {
        resolve(getFromLocalStorage());
      };
    });
  } catch {
    return getFromLocalStorage();
  }
}

export async function saveHistoryRecord(item: StoredHistoryItem): Promise<StoredHistoryItem[]> {
  try {
    const db = await openDB();
    const all = await getAllHistory();
    const updated = [item, ...all.filter(i => i.id !== item.id)].slice(0, 5);

    // Save to IndexedDB (clearing older ones outside top 5)
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      updated.forEach(it => store.put(it));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    // Also backup metadata to localStorage (without heavy audio data to prevent quota crash)
    saveToLocalStorageBackup(updated);

    return updated;
  } catch (err) {
    console.warn('IndexedDB save failed, using localStorage fallback:', err);
    const all = getFromLocalStorage();
    const updated = [item, ...all.filter(i => i.id !== item.id)].slice(0, 5);
    saveToLocalStorageBackup(updated);
    return updated;
  }
}

export async function deleteHistoryRecord(id: string): Promise<StoredHistoryItem[]> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (_) {}

  const current = getFromLocalStorage().filter(i => i.id !== id);
  saveToLocalStorageBackup(current);
  return getAllHistory();
}

export async function clearAllHistoryRecords(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (_) {}

  try {
    localStorage.removeItem('voicemaster_history_meta');
  } catch (_) {}
}

function getFromLocalStorage(): StoredHistoryItem[] {
  try {
    const data = localStorage.getItem('voicemaster_history_meta');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorageBackup(items: StoredHistoryItem[]): void {
  try {
    // Save metadata without excessive base64 audio to avoid QuotaExceededError
    const safeItems = items.map(it => ({
      ...it,
      audioUrl: it.audioUrl && it.audioUrl.length < 50000 ? it.audioUrl : undefined
    }));
    localStorage.setItem('voicemaster_history_meta', JSON.stringify(safeItems));
  } catch (_) {}
}
