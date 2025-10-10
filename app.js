const API_KEY = 'E272w1052-M68-5';
const LOCAL_STORAGE_KEY = 'time_event_announcer';

const DB_NAME = 'time_event_announcer_db';
const STORE_NAME = 'wav_store';
const CACHE_KEY = 'announce_wav';
const API_BASE_URL = `https://deprecatedapis.tts.quest/v2/voicevox/audio/?key=${API_KEY}&speaker=1&text={ANNOUNCE_TEXT}`;

const audio_ctx = new AudioContext();
const gain_node = audio_ctx.createGain();
let audio_buffer = null;
let last_fired_datetime = "";

const default_data = {
  is_announce_enabled: false,
  announce_text: "",
  announce_volume: 0.5,
  date_from: "",
  date_till: "",
  announce_time: "",
};

let dom_elems = {}

const parseJstDate = (date_str => {
  const [y, m, d] = date_str.split(/[\/\-]/).map(Number);
  return new Date(y, m-1, d, 0, 0, 0, 0);
});

/** IndexedDBを開きます。 */
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

/** IndexedDBへデータを追加します。 */
const putToIndexedDB = async (key, value) => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

/** IndexedDBからデータを取得します。 */
const getFromIndexedDB = async (key) => {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

/** 保存ボタンの状態を切り替えます。 */
const toggleSaveButton = (is_loading) => {
  if(is_loading) {
    dom_elems.save_btn.disabled = true;
    dom_elems.save_icon.classList.remove('fa-save');
    dom_elems.save_icon.classList.add('fa-spinner', 'fa-spin');
  } else {
    dom_elems.save_icon.classList.remove('fa-spinner', 'fa-spin');
    dom_elems.save_icon.classList.add('fa-save');
    dom_elems.save_btn.disabled = false;
  }
};

const toggleVoiceNotReady = (is_voice_not_ready) => {
  if(is_voice_not_ready) {
    dom_elems.voice_not_ready_notification.classList.remove('is-display-none');
    dom_elems.test_btn.disabled = true;
  } else {
    dom_elems.voice_not_ready_notification.classList.add('is-display-none');
    dom_elems.test_btn.disabled = false;
  }
};

/** Local Storageへデータを取得します。 */
const loadData = () => {
  const raw_data = localStorage.getItem(LOCAL_STORAGE_KEY) ?? '';
  if(raw_data === '') return default_data;
  return JSON.parse(raw_data);
}

/** 設定DOMへデータをセットします。 */
const setDomElemsValues = (data) => {
  dom_elems.announce_enabled_switch.checked = data.is_announce_enabled;
  dom_elems.announce_text.value = data.announce_text;
  dom_elems.announce_volume.value = data.announce_volume;
  dom_elems.date_from.value = data.date_from;
  dom_elems.date_till.value = data.date_till;
  dom_elems.announce_time.value = data.announce_time;
};

/** IndexedDBから音声をロードします */
const loadVoiceSource = async () => {
  try {
    const blob = await getFromIndexedDB(CACHE_KEY);
    if (!blob) return null;

    const array_buffer = await blob.arrayBuffer();
    audio_buffer = await audio_ctx.decodeAudioData(array_buffer);
  } catch(e) {
    console.error(e);
    audio_buffer = null;
  }
};

/** アナウンス音声を再生します。 */
const playAnnounceVoice = async (is_test) => {
  if(!audio_buffer) {
    if(is_test) alert("アナウンス音声がありません。")
    return;
  }

  if(typeof audio_ctx?.resume === 'function') await audio_ctx.resume();

  const data = loadData();
  gain_node.gain.value = Number.isFinite(data.announce_volume) ? data.announce_volume : 0.5;

  const source = audio_ctx.createBufferSource();
  source.buffer = audio_buffer;
  source.connect(gain_node);
  source.onended = () => {
    try { source.disconnect(); } catch(_) { }
  };
  source.start(0);
};

/** Local Storageへデータを保存します。アラート音声をAPIで取得してIndexed DBへ保存します。 */
const fetchAndSaveData = async () => {
  toggleSaveButton(true);
  const prev_data = loadData();
  const curr_data = {
    is_announce_enabled: dom_elems.announce_enabled_switch.checked,
    announce_text: dom_elems.announce_text.value,
    announce_volume: parseFloat(dom_elems.announce_volume.value),
    date_from: dom_elems.date_from.value,
    date_till: dom_elems.date_till.value,
    announce_time: dom_elems.announce_time.value,
  };

  const is_changed_text = prev_data.announce_text.trim() !== dom_elems.announce_text.value.trim();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(curr_data));

  if(!is_changed_text) {
    await new Promise(resolve => setTimeout(resolve, 500));
    toggleSaveButton(false);
    return;
  }

  const api_url = API_BASE_URL.replace('{ANNOUNCE_TEXT}', curr_data.announce_text);
  try {
    const res = await fetch(api_url);
    if(!res.ok) throw new Error('アナウンス音声の取得に失敗しました。');

    const blob = await res.blob();
    await putToIndexedDB(CACHE_KEY, blob);
    await loadVoiceSource();
    toggleVoiceNotReady(false);
  } catch(e) {
    alert(e.message);
  } finally {
    toggleSaveButton(false);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  dom_elems = {
    announce_enabled_switch: document.querySelector('#announce_enabled_switch'),
    announce_text: document.querySelector('#announce_text'),
    announce_volume: document.querySelector('#announce_volume'),
    date_from: document.querySelector('#date_from'),
    date_till: document.querySelector('#date_till'),
    announce_time: document.querySelector('#announce_time'),
    save_btn: document.querySelector('#save_btn'),
    clock: document.querySelector('#clock'),
    voice_not_ready_notification: document.querySelector('#voice_not_ready_notification'),
    test_btn: document.querySelector('#test_btn'),
  }
  dom_elems.save_icon = dom_elems.save_btn.querySelector("i");

  // 期間のDatePickerをセットします。
  new Lightpick({
    field: document.querySelector('#date_from'),
    secondField: document.querySelector('#date_till'),
    singleDate: false,
    format: 'YYYY/MM/DD',
    onSelect: (from, till) => {
    }
  });

  // アナウンス時刻のDatetimePickerをセットします。
  flatpickr('#announce_time', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i:S',
    time_24hr: true,
    enableSeconds: true,
    minuteIncrement: 1,
    secondIncrement: 1,
  });

  dom_elems.announce_enabled_switch.addEventListener('change', () => {
    const data = loadData();
    data.is_announce_enabled = dom_elems.announce_enabled_switch.checked;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  });

  dom_elems.announce_volume.addEventListener('change', () => {
    const data = loadData();
    data.announce_volume = dom_elems.announce_volume.value;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  });

  // 保存ボタンのクリックイベントをセットします。
  dom_elems.save_btn.addEventListener('click', async () => {
    await fetchAndSaveData()
  });

  // Local Storageから設定を取得してDOMへセットします。
  const data = loadData();
  setDomElemsValues(data);

  // IndexedDBから音声をロードします。
  await loadVoiceSource();
  try {
    gain_node.connect(audio_ctx.destination);
  } catch (_) {}

  dom_elems.test_btn.addEventListener('click', () => {
    playAnnounceVoice(true);
  });

  toggleVoiceNotReady(!audio_buffer);
  // toggleVoiceNotReady(true);
});

/** アナウンス時刻になったらアナウンス音声を再生します。 */
setInterval(() => {
  const now = new Date();
  dom_elems.clock.textContent = now.toLocaleTimeString();

  const is_announce_enabled = dom_elems.announce_enabled_switch.checked;
  if(!is_announce_enabled) return;

  const date_from = parseJstDate(dom_elems.date_from.value);
  const date_till = new Date(parseJstDate(dom_elems.date_till.value).getTime() + 24* 60 * 60 * 1000 - 1);
  if(now < date_from || date_till < now) return;

  const announce_time = dom_elems.announce_time.value;
  const m = announce_time.match(/^(\d{2}):(\d{2}):(\d{2})$/)
  if(!m) return;

  const [_, hh, mm, ss] = m.map(Number);
  const is_same_second = now.getHours() === hh
      && now.getMinutes() === mm
      && now.getSeconds() === ss;

  if(!is_same_second) return;
  if(last_fired_datetime === now.toLocaleString()) return;

  last_fired_datetime = now.toLocaleString();
  playAnnounceVoice(false).then(r => {});
}, 1000);
