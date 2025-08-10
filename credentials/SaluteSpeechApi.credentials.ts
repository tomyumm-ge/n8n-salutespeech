import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SaluteSpeechApi implements ICredentialType {
	name = 'saluteSpeechApi';
	icon: Icon = 'file:temp-salute.svg';
	displayName = 'SaluteSpeech API';
	documentationUrl = 'https://developers.sber.ru/docs/ru/salutespeech/overview';
	properties: INodeProperties[] = [
		{
			displayName: 'Authorization key',
			name: 'authorizationKey',
			type: 'string',
			default: '',
			required: true,
			description: 'Base64 encoded log:pass pair (authKey)',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'options',
			description: 'Type of account',
			default: 'SALUTE_SPEECH_PERS',
			options: [
				{
					name: 'SALUTE_SPEECH_PERS',
					description: 'Individual account',
					value: 'SALUTE_SPEECH_PERS',
				},
				{
					name: 'SALUTE_SPEECH_CORP',
					description: 'Business account',
					value: 'SALUTE_SPEECH_CORP',
				},
				{
					name: 'SBER_SPEECH',
					description: 'Business account (outdated)',
					value: 'SBER_SPEECH',
				},
			],
		},
		{
			displayName: 'Base URL',
			name: 'base_url',
			type: 'string',
			default: 'https://smartspeech.sber.ru/rest/v1',
			required: true,
			description: 'Base url for doing request (change it ONLY if you know what are you doing)',
		},
		{
			displayName: 'Auth URL',
			name: 'auth_url',
			type: 'string',
			default: 'https://ngw.devices.sberbank.ru:9443',
			required: true,
			description:
				'Auth url for authorization flow (change it ONLY if you know what are you doing)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Basic " + $credentials.authorizationKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.auth_url ?? "https://ngw.devices.sberbank.ru:9443"}}',
			url: '/api/v2/oauth',
			method: 'POST',
			headers: {
				RqUID:
					'={{"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => (c == "x" ? (Math.random() * 16 | 0) : (Math.random() * 4 | 8)).toString(16))}}',
				Authorization: '={{"Basic " + $credentials.authorizationKey}}',
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
			},
			body: {
				scope: '={{$credentials.scope}}',
			},
			skipSslCertificateValidation: true,
		},
	};
}
