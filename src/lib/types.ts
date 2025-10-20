export type AppData = {
	isAnnounceEnabled: boolean;
	announceVolume: number;
	announceText: string;
	dateFrom: number;
	dateTill: number;
	announceTimes: string[];
};

export const defaultAppData: AppData = {
	isAnnounceEnabled: false,
	announceVolume: 0.5,
	announceText: '',
	dateFrom: 0,
	dateTill: 0,
	announceTimes: []
};
