import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const smartSpeechModels: Array<INodePropertyOptions | INodeProperties> = [
	{
		name: 'General',
		value: 'general',
	},
	{
		name: 'Call Center',
		value: 'callcenter',
	},
	{
		name: 'Media',
		value: 'media',
	},
	{
		name: 'IVR',
		value: 'ivr',
	},
];

export const smartSpeechLanguages: Array<INodePropertyOptions | INodeProperties> = [
	{
		name: 'Русский',
		value: 'ru-RU',
	},
	{
		name: 'Английский',
		value: 'en-US',
	},
];

export const smartSpeechVoices: Array<INodePropertyOptions | INodeProperties> = [
	{
		name: 'Наталья',
		value: 'Nec',
	},
	{
		name: 'Борис',
		value: 'Bys',
	},
	{
		name: 'Марфа',
		value: 'May',
	},
	{
		name: 'Тарас',
		value: 'Tur',
	},
	{
		name: 'Александра',
		value: 'Ost',
	},
	{
		name: 'Сергей',
		value: 'Pon',
	},
	{
		name: 'Kira',
		value: 'Kin',
		description: 'Синтез английской речи',
	},
	{
		displayName: 'Указать свой',
		name: 'customVoice',
		type: 'string',
		default: '',
		description:
			'Если у вас есть брендированный голос SaluteSpeech YourVoice - его можно указать тут',
	},
];

// wav16, pcm16, opus, alaw, g729
export const smartSpeechFormats: INodePropertyOptions[] = [
	{
		name: 'WAV16',
		value: 'wav16',
		description: 'Большой файл, но без потерь',
	},
	{
		name: 'PCM16',
		value: 'pcm16',
		description: 'Высокое качество звука и высокая совместимость',
	},
	{
		name: 'OPUS',
		value: 'opus',
		description: 'Используйте для отправки голосовых в Telegram',
	},
	{
		name: 'ALAW',
		value: 'alaw',
		description: 'Используется для VoIP',
	},
	{
		name: 'G729',
		value: 'g729',
		description: 'Используется для VoIP (меньшее качество звука)',
	},
];

// 24000, 8000
export const smartSpeechHertz: INodePropertyOptions[] = [
	{
		name: '24000 Hz',
		value: '24000',
		description: 'Используйте всегда, если не VoIP',
	},
	{
		name: '8000 Hz',
		value: '8000',
		description: 'Для VoIP используйте только его',
	},
];
