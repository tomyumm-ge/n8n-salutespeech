import { AxiosInstance, AxiosRequestConfig, AxiosResponse, RawAxiosRequestConfig } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from './exception';

interface SpeechRecognizeArgs {
	file: File;
	language?: 'ru-RU' | 'en-US';
	profanity?: boolean;
	model?: 'general' | 'callcenter' | 'media' | 'ivr';
	sampleRate?: number;
	channelsCount?: number;
	accessToken?: string;
}

function getRequestConfig({
	file,
	language = 'ru-RU',
	profanity = true,
	model = 'general',
	sampleRate = 16000,
	channelsCount = 1,
	accessToken,
}: SpeechRecognizeArgs): RawAxiosRequestConfig {
	const headers = { ...buildHeaders(accessToken), 'Content-Type': file.type };

	const query = {
		language,
		enable_profanity_filter: profanity,
		model,
		sample_rate: sampleRate,
		channels_count: channelsCount,
	};

	return {
		method: 'POST',
		url: '/speech:recognize',
		data: file,
		params: query,
		headers: headers,
	} as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse) {
	if (response.status === 200) {
		return response.data;
	} else if (response.status === 401) {
		console.error(response.data);
		throw new AuthenticationError(response);
	} else {
		console.error(response.data);
		throw new ResponseError(response);
	}
}

export async function post_speech_recognize(
	client: AxiosInstance,
	args: SpeechRecognizeArgs,
): Promise<string[]> {
	const config = getRequestConfig(args);
	console.log('post_speech_recognize.config', config);
	const response = await client.request(config);
	console.log('post_speech_recognize.response', response);
	return buildResponse(response).result || [];
}
