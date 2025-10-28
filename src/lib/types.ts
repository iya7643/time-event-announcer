import  type * as ToneNS from 'tone';

export type AnnounceTime = {
	no: number;
	time: string;
	timestamp: number;
	audioId: string;
};

export type AppData = {
	isAnnounceEnabled: boolean;
	announceVolume: number;
	dateFrom: number;
	dateTill: number;
	announceTimes: AnnounceTime[];
	audios: Record<string, string>;
};

export const defaultAppData: AppData = {
	isAnnounceEnabled: false,
	announceVolume: 0.5,
	dateFrom: 0,
	dateTill: 0,
	announceTimes: Array.from({ length: 15}, (_, no) => ({
		no: no,
		time: '',
		timestamp: 0,
		audioId: 'beep',
	})),
	audios: {},
};

export type ToneModule = typeof ToneNS;
