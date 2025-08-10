import { USER_AGENT } from './constants';

export function buildHeaders(accessToken?: string): Record<string, string> {
	const headers: Record<string, string> = {};

	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	}
	headers['User-Agent'] = USER_AGENT;

	return headers;
}
