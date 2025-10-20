import  type * as ToneNS from 'tone';

export type AppData = {
	isAnnounceEnabled: boolean;
	isTextToSpeech: boolean;
	announceText: string;
	announceVolume: number;
	dateFrom: number;
	dateTill: number;
	announceTimes: string[];
};

export const defaultAppData: AppData = {
	isAnnounceEnabled: false,
	isTextToSpeech: false,
	announceText: '',
	announceVolume: 0.5,
	dateFrom: 0,
	dateTill: 0,
	announceTimes: []
};

export type ToneModule = typeof ToneNS;
