import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { getDefaultSettings, Settings } from './Settings';
import { AccessToken } from './interfaces';
import { post_auth } from './PostAuth';
import { AuthenticationError } from './exception';
import { post_speech_recognize } from './PostSpeechRecognize';
import { post_text_synthesize } from './PostTextSynthesize';

export interface SaluteSpeechClientConfig {
	authKey?: string;
	scope?: string;
	baseUrl?: string;
	authUrl?: string;
	accessToken?: string;
	httpsAgent?: any;
}

class SaluteSpeechApiClientInstance {
	public _client: AxiosInstance;
	public _authClient: AxiosInstance;
	public _settings: Settings;
	protected _accessToken?: AccessToken;

	constructor(config: SaluteSpeechClientConfig) {
		this._settings = {
			...getDefaultSettings(),
			...config,
		} as Settings;

		if (this._settings.accessToken) {
			this._accessToken = {
				access_token: this._settings.accessToken,
				expires_at: 0,
			};
		}

		this._client = axios.create(this._getAxiosConfig());
		this._authClient = axios.create(this._getAuthAxiosConfig());
	}

	async updateConfig(config: SaluteSpeechClientConfig) {
		if (this._settings.credentials !== config.authKey) {
			this._settings = { ...this._settings, ...config };
			this._settings.credentials = config.authKey ?? undefined;
			const axiosConfig = {
				timeout: this._settings.timeout * 1000,
				httpsAgent: this._settings.httpsAgent,
				validateStatus: () => true,
			};

			this._client = axios.create({
				baseURL: this._settings.baseUrl,
				...axiosConfig,
			});

			this._authClient = axios.create(axiosConfig);

			this._accessToken = undefined;
			this._settings.accessToken = undefined;

			await this.updateToken();
		}
	}

	protected get token(): string | undefined {
		return this._accessToken?.access_token;
	}

	protected get useAuth(): boolean {
		return Boolean(this._settings.credentials);
	}

	protected checkValidityToken(): boolean {
		return !!this._accessToken;
	}

	protected resetToken(): void {
		this._accessToken = undefined;
	}

	private _getAxiosConfig(): CreateAxiosDefaults {
		return {
			baseURL: this._settings.baseUrl,
			timeout: this._settings.timeout * 1000,
			httpsAgent: this._settings.httpsAgent,
			validateStatus: () => true,
		};
	}

	private _getAuthAxiosConfig(): CreateAxiosDefaults {
		return {
			timeout: this._settings.timeout * 1000,
			httpsAgent: this._settings.httpsAgent,
			validateStatus: () => true,
		};
	}

	public async updateToken(): Promise<void> {
		if (this._settings.credentials) {
			this._accessToken = await post_auth(this._authClient, {
				url: this._settings.authUrl,
				credentials: this._settings.credentials,
				scope: this._settings.scope,
			});
			console.info('OAUTH UPDATE TOKEN');
		}
	}

	private async _decorator<T>(call: () => Promise<T>): Promise<T> {
		console.log('_decorator.useAuth', this.useAuth);
		if (this.useAuth) {
			console.log('_decorator.checkValidityToken', this.checkValidityToken());
			if (this.checkValidityToken()) {
				try {
					return await call();
				} catch (error) {
					console.error('_decorator.error', error);
					if (error instanceof AuthenticationError) {
						console.warn('AUTHENTICATION ERROR');
						this.resetToken();
					} else {
						throw error;
					}
				}
			}
			await this.updateToken();
		}
		return await call();
	}

	public async speechRecognize(
		file: File,
		lang: 'ru-RU' | 'en-US',
		profanity: boolean,
		model: 'general' | 'callcenter' | 'media' | 'ivr',
		channelsCount: number,
	): Promise<string[]> {
		return this._decorator(() =>
			post_speech_recognize(this._client, {
				file,
				language: lang,
				profanity,
				model,
				channelsCount,
				accessToken: this._accessToken?.access_token,
			}),
		);
	}

	public async textSynthesize(
		text: string,
		voiceId: string,
		format: string,
		freq: string,
	): Promise<any> {
		return this._decorator(() =>
			post_text_synthesize(this._client, {
				text,
				voiceId,
				format,
				freq,
				accessToken: this._accessToken?.access_token,
			}),
		);
	}
}

export const SaluteSpeechApiClient = new SaluteSpeechApiClientInstance({});
