import { AxiosInstance, AxiosRequestConfig, AxiosResponse, RawAxiosRequestConfig } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from './exception';

interface TextSynthesizeArgs {
	text: string;
	voiceId: string;
	format: string;
	freq: string;
	accessToken?: string;
}

export interface TextSynthesizeResponse {
	buffer: Buffer;
	mime: string;
	fileName: string;
	size: number;
	headers: Record<string, any>;
}

function getRequestConfig({
	text,
	voiceId,
	format,
	freq,
	accessToken,
}: TextSynthesizeArgs): RawAxiosRequestConfig {
	const headers = { ...buildHeaders(accessToken), 'Content-Type': 'application/text' };

	const query = {
		format,
		voice: `${voiceId}_${freq}`,
	};

	return {
		method: 'POST',
		url: '/text:synthesize',
		data: text,
		params: query,
		headers: headers,
		responseType: 'arraybuffer',
	} as AxiosRequestConfig;
}

function mimeAndExtByFormat(format: string): { mime: string; ext: string } {
	switch ((format || '').toLowerCase()) {
		case 'wav16':
			return { mime: 'audio/wav', ext: 'wav' };
		case 'pcm16':
			return { mime: 'audio/L16', ext: 'pcm' };
		case 'opus':
			return { mime: 'audio/ogg', ext: 'ogg' };
		case 'alaw':
			return { mime: 'audio/PCMA', ext: 'alaw' };
		case 'g729':
			return { mime: 'audio/G729', ext: 'g729' };
		default:
			return { mime: 'application/octet-stream', ext: 'bin' };
	}
}

function buildResponse(response: AxiosResponse, format: string): TextSynthesizeResponse {
	if (response.status === 200) {
		const buffer = Buffer.from(response.data as ArrayBuffer);
		const { mime, ext } = mimeAndExtByFormat(format);
		const fileName = `audio.${ext}`;

		return {
			buffer,
			mime,
			fileName,
			size: buffer.byteLength,
			headers: response.headers ?? {},
		};
	} else if (response.status === 401) {
		console.error(response.data);
		throw new AuthenticationError(response);
	} else {
		console.error(response.data);
		throw new ResponseError(response);
	}
}

export async function post_text_synthesize(
	client: AxiosInstance,
	args: TextSynthesizeArgs,
): Promise<any> {
	const config = getRequestConfig(args);
	console.log('post_text_synthesize.config', config);
	const response = await client.request(config);
	console.log('post_text_synthesize.response', response);
	return buildResponse(response, args.format) || [];
}
