import { browser } from '$app/environment';
import { announceVolume } from '$lib/stores';
import { CACHE_KEY } from '$lib/constants';
import { get, writable } from 'svelte/store';
import { getDataFromDb } from '$lib/IndexedDbHelper';

/** アナウンス音声再生準備OK（音声ダウンロード済み） */
export let isAudioReady = writable<boolean>(true);

export let audioContextState = writable<AudioContextState | null>(null);


let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let audioBuffer: AudioBuffer | null = null;

const ensureAudio = () => {
	if (!browser) return;
	if (!audioCtx) audioCtx = new AudioContext();
	if (!gainNode && audioCtx) {
		gainNode = audioCtx.createGain();
		try {
			gainNode.connect(audioCtx.destination);
		} catch (e) {}
	}
};

const decodeVoiceBlob = async (blob: Blob) => {
	ensureAudio();
	if (!audioCtx) return null;

	const arr = await blob.arrayBuffer();
	audioBuffer = await audioCtx.decodeAudioData(arr);
	isAudioReady.set(!!audioBuffer);
	return audioBuffer;
};

export const loadVoiceFromIdb = async () => {
	const blob = await getDataFromDb<Blob>(CACHE_KEY);
	if (!blob) {
		isAudioReady.set(false);
		return null;
	}
	return decodeVoiceBlob(blob);
};

export const playVoice = async (isTest: boolean) => {
	if (!audioCtx) {
		isAudioReady.set(false);
		if (isTest && browser) alert('アナウンス音声がありません。');
		return;
	}

	ensureAudio();
	if (!audioCtx || !gainNode) return;

	if (typeof audioCtx.resume === 'function') await audioCtx.resume();

	gainNode.gain.value = get(announceVolume);
	const src = audioCtx.createBufferSource();
	src.buffer = audioBuffer;
	src.connect(gainNode);
	src.onended = () => {
		try {
			src.disconnect();
		} catch (e) {}
	};
	src.start(0);
};

export const beep = async () => {
	ensureAudio();
	if (!audioCtx || !gainNode) return;

	const osc = audioCtx.createOscillator();
	const gain = audioCtx.createGain();

	osc.type = 'sine';
	osc.frequency.value = 400;
	const volume = get(announceVolume) / 2;
	gain.gain.value = volume === 0 ? 0 : Math.max(volume, 0.1);

	const now = audioCtx.currentTime;
	osc.connect(gain).connect(gainNode);
	osc.start(now);
	osc.stop(now + 0.1);

	osc.onended = () => {
		try {
			osc.disconnect();
			gain.disconnect();
		} catch (e) {}
	};
};

export const unlockAudio = async () => {
	ensureAudio();
	if (!audioCtx || !gainNode) return;

	try {
		if (audioCtx.state === 'suspended') {
			await audioCtx.resume();
		}
		return audioCtx.state === 'running';
	} catch (e) {
		return false;
	}
};

export const getAudioContextState = (): AudioContextState | null => {
	if (!audioCtx) return null;
	return audioCtx.state;
};
