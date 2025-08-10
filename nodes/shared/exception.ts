import { AxiosResponse } from 'axios';

export class SaluteSpeechException extends Error {
	public response: AxiosResponse;

	constructor(response: AxiosResponse) {
		super(response.data);
		this.name = 'GigaChatException';
		this.response = response;
	}
}

export class ResponseError extends SaluteSpeechException {
	constructor(response: AxiosResponse) {
		super(response);
		this.name = 'ResponseError';
	}
}

export class AuthenticationError extends ResponseError {
	constructor(response: AxiosResponse) {
		super(response);
		this.name = 'AuthenticationError';
	}
}
