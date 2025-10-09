const db_name = 'audio_db';
const store_name = 'wav_store';
const cache_key = 'sample_wav'; // 任意のキー
const wav_url = 'https://deprecatedapis.tts.quest/v2/voicevox/audio/?key=E272w1052-M68-5&speaker=1&text=こんにちはなのだ'; // ここを差し替え

document.addEventListener('DOMContentLoaded', () => {
  new Lightpick({
    field: document.querySelector("#date_from"),
    secondField: document.querySelector("#date_till"),
    singleDate: false,
    format: 'YYYY/MM/DD',
    onSelect: (from, till) => {
    }
  });

  flatpickr("#time_announce", {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i:S',
    time_24hr: true,
    enableSeconds: true,
    minuteIncrement: 1,
    secondIncrement: 1,
  });
});

// --- IndexedDB helpers ---
// function open_db() {
//     return new Promise((resolve, reject) => {
//         const req = indexedDB.open(db_name, 1);
//         req.onupgradeneeded = () => {
//             req.result.createObjectStore(store_name);
//         };
//         req.onsuccess = () => resolve(req.result);
//         req.onerror = () => reject(req.error);
//     });
// }
//
// async function idb_put(key, value) {
//     const db = await open_db();
//     return new Promise((resolve, reject) => {
//         const tx = db.transaction(store_name, 'readwrite');
//         tx.objectStore(store_name).put(value, key);
//         tx.oncomplete = () => resolve();
//         tx.onerror = () => reject(tx.error);
//     });
// }
//
// async function idb_get(key) {
//     const db = await open_db();
//     return new Promise((resolve, reject) => {
//         const tx = db.transaction(store_name, 'readonly');
//         const req = tx.objectStore(store_name).get(key);
//         req.onsuccess = () => resolve(req.result || null);
//         req.onerror = () => reject(req.error);
//     });
// }

// --- download -> save as Blob ---
// async function download_wav(url) {
//     const res = await fetch(url, {
//         // 認証が必要ならここでヘッダを付ける
//         // headers: { Authorization: 'Bearer xxx' }
//     });
//     if (!res.ok) throw new Error(`http ${res.status}`);
//     const blob = await res.blob(); // Content-Type: audio/wav が望ましい
//     return blob;
// }

// --- play from Blob ---
// function play_blob(blob) {
//     const audio_el = document.getElementById('player');
//     if (audio_el.dataset.objectUrl) {
//         URL.revokeObjectURL(audio_el.dataset.objectUrl);
//     }
//     const object_url = URL.createObjectURL(blob);
//     audio_el.dataset.objectUrl = object_url;
//     audio_el.src = object_url;
//     audio_el.play().catch(() => {
//         // 自動再生失敗時はユーザーに再生してもらう
//         console.log('autoplay blocked; click play button or use user gesture');
//     });
// }

// --- wire up buttons ---
// document.getElementById('btn-download').addEventListener('click', async () => {
//     try {
//         const blob = await download_wav(wav_url);
//         await idb_put(cache_key, blob);
//         console.log('saved to IndexedDB');
//     } catch (e) {
//         console.error(e);
//     }
// });
//
// document.getElementById('btn-play').addEventListener('click', async () => {
//     const blob = await idb_get(cache_key);
//     if (!blob) {
//         console.log('not cached yet; downloading...');
//         try {
//             const fresh = await download_wav(wav_url);
//             await idb_put(cache_key, fresh);
//             play_blob(fresh);
//         } catch (e) {
//             console.error(e);
//         }
//         return;
//     }
//     play_blob(blob);
// });
