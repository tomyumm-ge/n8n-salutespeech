import {
	BINARY_ENCODING,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeExecutionWithMetadata,
	NodeOperationError,
} from 'n8n-workflow';
import {
	smartSpeechFormats,
	smartSpeechHertz,
	smartSpeechLanguages,
	smartSpeechModels,
	smartSpeechVoices,
} from './constants';
import { SaluteSpeechApiClient } from '../shared/SaluteSpeechApiClient';
import { Agent } from 'node:https';

export class SaluteSpeech implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SaluteSpeech',
		name: 'saluteSpeech',
		icon: 'file:temp-salute.svg',
		group: ['input'],
		version: 1,
		defaults: {
			name: 'SaluteSpeech API',
		},
		description: 'Transform your voice into text',
		// eslint-disable-next-line
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'saluteSpeechApi',
				required: true,
			},
		],
		requestDefaults: {
			skipSslCertificateValidation: true,
		},
		properties: [
			{
				displayName: 'Ресурс',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Речь',
						value: 'speech',
						description: 'Работа с готовой речью',
					},
					{ name: 'Текст', value: 'text', description: 'Работа с текстом' },
				],
				default: 'speech',
			},
			{
				displayName: 'Операция',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['speech'],
					},
				},
				options: [
					{
						name: 'Распознать речь',
						value: 'recognize',
						description: 'Распознать речь в аудио файле',
						action: 'Speech recognition',
					},
				],
				default: 'recognize',
			},
			{
				displayName: 'Операция',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['text'],
					},
				},
				options: [
					{
						name: 'Синтезировать речь',
						value: 'synthesize',
						action: 'Speech synthesis',
					},
				],
				default: 'synthesize',
			},
			// -------------------------
			//      speech:recognize
			// -------------------------
			{
				displayName: 'Voice Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				hint: 'Имя поля с аудио, которое надо отправить.',
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				placeholder: '',
				description: 'Name of the binary property that contains the data to upload',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				description: 'Source language',
				options: smartSpeechLanguages,
				default: 'ru-RU',
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				required: true,
			},
			{
				displayName: 'Модель',
				name: 'model',
				type: 'options',
				description: 'Модель для анализа аудио',
				options: smartSpeechModels,
				default: 'general',
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				required: true,
			},
			{
				displayName: 'Фильтр цензуры',
				name: 'profanityFilter',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				// eslint-disable-next-line
				description: 'Включить/выключить фильтр обсценной лексики',
			},
			{
				displayName: 'Частота дискретизации',
				name: 'sampleRate',
				type: 'number',
				default: 16000,
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				description:
					'Частота дискретизации. Максимально возможное значение — до 96000Гц. Меняйте, только если знаете, что делаете.',
			},
			{
				displayName: 'Кол-во каналов',
				name: 'channelsCount',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				description:
					'Количество каналов в многоканальном аудио. Для OGG войсов - 1 канал. Меняйте, только если знаете, что делаете.',
			},
			{
				displayName: 'Соединить ответ',
				name: 'combineArray',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
					},
				},
				// eslint-disable-next-line
				description: 'Соединить ответ в одну строку?',
			},
			{
				displayName: 'Символ соединения',
				name: 'combineSymbol',
				type: 'string',
				default: '\n',
				displayOptions: {
					show: {
						operation: ['recognize'],
						resource: ['speech'],
						combineArray: [true],
					},
				},
				typeOptions: {
					rows: 2,
				},
				description: 'Символ соединения строк. По умолчанию - перенос строки.',
				hint: 'Переключите на Expression, чтобы добавить переносы строк',
			},
			// -------------------------
			//      text:synthesize
			// -------------------------
			{
				displayName: 'Voice',
				name: 'voiceId',
				type: 'options',
				description: 'Voice to use',
				options: smartSpeechVoices,
				default: 'Nec',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				required: true,
			},
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				description: 'Output audio format (codec)',
				options: smartSpeechFormats,
				default: 'wav16',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				required: true,
			},
			{
				displayName: 'Frequency',
				name: 'freq',
				type: 'options',
				description: 'Frequency of audio (Hz)',
				options: smartSpeechHertz,
				default: '24000',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				required: true,
			},
			{
				displayName: 'Текст',
				name: 'textInput',
				type: 'string',
				description: 'Текст, который нужно озвучить',
				default: '',
				placeholder: 'Внимание, говорит Москва...',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				typeOptions: {
					rows: 4,
				},
				required: true,
			},
			{
				displayName: 'Output Binary Property Name',
				name: 'outputPropertyName',
				type: 'string',
				description: 'Название переменной, в которой выложить аудио файл',
				default: 'data',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				required: true,
			},
		],
	};

	async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('saluteSpeechApi');

		const scope = credentials.scope ? String(credentials.scope) : 'SALUTE_SPEECH_PERS';

		await SaluteSpeechApiClient.updateConfig({
			authKey: credentials.authorizationKey as string,
			scope,
			baseUrl: String(credentials.base_url) || 'https://smartspeech.sber.ru/rest/v1',
			authUrl: credentials.auth_url
				? `${credentials.auth_url}/api/v2/oauth`
				: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
			httpsAgent: new Agent({
				rejectUnauthorized: false,
			}),
		});

		for (let i = 0; i < items.length; i++) {
			try {
				// -------------------------
				//      speech:recognize
				// -------------------------
				if (resource === 'speech' && operation === 'recognize') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0);
					const model = this.getNodeParameter('model', 0) as
						| 'general'
						| 'callcenter'
						| 'media'
						| 'ivr';
					const profanity = this.getNodeParameter('profanityFilter', 0) as boolean;
					const lang = this.getNodeParameter('language', 0) as 'ru-RU' | 'en-US';
					const channelsCount = this.getNodeParameter('channelsCount', 0) as number;
					const combineArray = this.getNodeParameter('combineArray', 0) as boolean;
					const itemBinaryData = items[i].binary![binaryPropertyName];
					const itemBuffer = Buffer.from(itemBinaryData.data, BINARY_ENCODING);

					let mimeType = itemBinaryData.mimeType;

					if (mimeType.includes('ogg')) {
						// QQ Telega
						mimeType = 'audio/ogg;codecs=opus';
					}

					const speechRecognized = await SaluteSpeechApiClient.speechRecognize(
						new File(
							[itemBuffer],
							itemBinaryData.fileName || `file${itemBinaryData.fileExtension || 'bin'}`,
							{
								type: mimeType,
							},
						),
						lang,
						profanity,
						model,
						channelsCount,
					);

					let final: string[] | string = speechRecognized;
					if (combineArray) {
						const combineSymbol = this.getNodeParameter('combineSymbol', 0) as string;
						final = final.join(combineSymbol);
					}

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ response: final }),
						{
							itemData: { item: i },
						},
					);

					if (Array.isArray(executionData)) {
						returnData.push(...executionData);
					} else {
						returnData.push(executionData);
					}
				}
				// -------------------------
				//      text:synthesize
				// -------------------------
				if (resource === 'text' && operation === 'synthesize') {
					const voiceId = this.getNodeParameter('voiceId', 0) as string;
					const format = this.getNodeParameter('format', 0) as string;
					const freq = this.getNodeParameter('freq', 0) as string;
					const text = this.getNodeParameter('textInput', 0) as string;
					const outputPropertyName = this.getNodeParameter('outputPropertyName', 0) as string;

					const synthesis = await SaluteSpeechApiClient.textSynthesize(text, voiceId, format, freq);

					const bin = await this.helpers.prepareBinaryData(
						synthesis.buffer,
						synthesis.fileName,
						synthesis.mime,
					);

					returnData.push({
						json: { format: bin.format },
						binary: { [outputPropertyName]: bin },
					});
				}
			} catch (error) {
				let errorMessage: string;

				if (error instanceof Error) {
					errorMessage = error.message;
				} else if (typeof error === 'object' && error !== null) {
					// Try to extract meaningful information from the error object
					if (
						'response' in error &&
						typeof error.response === 'object' &&
						error.response !== null
					) {
						const response = error.response as any;
						if (response.data && typeof response.data === 'object') {
							errorMessage = JSON.stringify(response.data);
						} else if (response.statusText) {
							errorMessage = `HTTP ${response.status}: ${response.statusText}`;
						} else {
							errorMessage = `HTTP Error: ${response.status}`;
						}
					} else {
						errorMessage = JSON.stringify(error);
					}
				} else {
					errorMessage = String(error);
				}

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i });
			}
		}
		return [returnData];
	}
}
