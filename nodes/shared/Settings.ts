const ENV_PREFIX = 'SALUTESPEECH_';

interface Settings {
	baseUrl: string;
	authUrl: string;
	credentials?: string;
	scope: string;
	accessToken?: string;
	profanityCheck?: boolean;
	timeout: number;
	verbose: boolean;
	httpsAgent?: any;
}

function getDefaultSettings(): Settings {
	const BASE_URL = process?.env[`${ENV_PREFIX}BASE_URL`] || 'https://smartspeech.sber.ru/rest/v1';
	const AUTH_URL =
		process?.env[`${ENV_PREFIX}AUTH_URL`] || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
	const SCOPE = process?.env[`${ENV_PREFIX}SCOPE`] || 'SALUTE_SPEECH_PERS';

	return {
		baseUrl: BASE_URL,
		authUrl: AUTH_URL,
		scope: SCOPE,
		timeout: parseFloat(process?.env[`${ENV_PREFIX}TIMEOUT`] || '30.0'),
		verbose: process?.env[`${ENV_PREFIX}VERBOSE`] === 'true',
		credentials: process?.env[`${ENV_PREFIX}CREDENTIALS`] || undefined,
		accessToken: process?.env[`${ENV_PREFIX}ACCESS_TOKEN`] || undefined,
		profanityCheck: process?.env[`${ENV_PREFIX}PROFANITY_CHECK`] === 'true',
	};
}

export type { Settings };

export { getDefaultSettings, ENV_PREFIX };
