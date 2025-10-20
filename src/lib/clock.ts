import { get, writable } from 'svelte/store';
import { format } from 'date-fns';
import { isAudioEnabled, playAudio, playBeep } from '$lib/audio';
import { announceTimestamps, announceVolume, isAnnounceEnabled, isTextToSpeech } from '$lib/stores';
import { DAYS, LOCAL_STORAGE_KEY } from '$lib/constants';
import { type AppData, defaultAppData } from '$lib/types';
import { browser } from '$app/environment';

/** 本日日付 */
export let today = writable<string>("2025/01/01(Wed)");

/** 現在時刻 */
export let nowTime = writable<string>('00:00:00');

/** 時計タイマー停止フラグ */
export let clockTimerStopped = writable<boolean>(false);

/**
 *
 */
export const startClockAligned = () => {
	const now = Date.now();
	const ms = now % 1000; // 現在時刻のミリ秒部分
	const delay = 1000 - ms; // 次の「ミリ秒0」までの残り

	// 秒の境目まで待ってからスタート
	setTimeout(() => {
		if (get(clockTimerStopped)) return;

		updateClock(); // ちょうどのタイミングで初回実行
		startPreciseTimer();
	}, delay);
}

/**
 *
 */
const startPreciseTimer = () => {
	let expected = performance.now() + 1000;

	function tick() {
		if (get(clockTimerStopped)) return;

		updateClock();

		const now = performance.now();
		const drift = now - expected;
		expected += 1000;
		setTimeout(tick, Math.max(0, 1000 - drift));
	}

	setTimeout(tick, 1000);
}

/**
 * 時刻の表示を更新して、アナウンス音声やカウントダウン音を鳴らします。
 */
const updateClock = () => {
	if (!browser) return;

	const now = new Date();
	today.set(`${format(now, 'yyyy/MM/dd')} (${DAYS[now.getDay()]})`);
	nowTime.set(format(now, 'HH:mm:ss'));

	// トグルスイッチがOFFの場合、何もしません。
	if (!get(isAnnounceEnabled)) return;

	// 自動再生の許可がない場合、何もしません。
	if (!get(isAudioEnabled)) return;

	const appData = JSON.parse(
		localStorage.getItem(LOCAL_STORAGE_KEY) ?? JSON.stringify(defaultAppData)
	) as AppData;

	// appDataが未設定の場合、何もしません。
	if (!appData.announceText || !appData.dateFrom || !appData.dateTill) return;
	if (appData.announceTimes.every(s => s === '')) return;

	// 期間外の場合、何もしません。
	const nowMs = now.getTime();
	{
		const till = appData.dateTill + 24 * 60 * 60 * 1000 - 1;
		if (nowMs < appData.dateFrom || till < nowMs) return;
	}

	const targetTimestamps = get(announceTimestamps);
	const volume = get(announceVolume);
	// const formattedNow = format(now, 'HH:mm:ss.SSS');
	{
		const shouldFire = targetTimestamps.some((ts) => {
			const diff = nowMs - ts;
			return Math.abs(diff) <= 0.2 * 1000;
		});
		if (shouldFire) {
			// console.log(`${formattedNow}: アナウンス音声再生`);
			get(isTextToSpeech) ? playAudio() : playBeep(523, 0.6, volume);
			return;
		}
	}
	{
		const shouldBeep = targetTimestamps.some((ts) => {
			const diff = nowMs - ts;
			return -5.2 * 1000 <= diff && diff <= -0.2 * 1000;
		});
		if (shouldBeep) {
			// console.log(`${formattedNow}: ビープ音再生`);
			void playBeep(880, 0.15, volume/2);
			return;
		}
	}
	// console.log(`${formattedNow}: 何も再生しない`);
};
