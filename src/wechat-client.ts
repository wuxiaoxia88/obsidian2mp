import { requestUrl, RequestUrlResponse } from 'obsidian';
import { WeChatTokenResult, WeChatUploadResult, WeChatDraftResult, WeChatDraftArticle } from './types';

const WX_API_BASE = 'https://api.weixin.qq.com/cgi-bin';

export class WeChatClient {
	private appId: string;
	private appSecret: string;
	private accessToken: string | null = null;
	private tokenExpiry: number = 0;

	constructor(appId: string, appSecret: string) {
		this.appId = appId;
		this.appSecret = appSecret;
	}

	updateCredentials(appId: string, appSecret: string) {
		if (this.appId !== appId || this.appSecret !== appSecret) {
			this.appId = appId;
			this.appSecret = appSecret;
			this.accessToken = null;
			this.tokenExpiry = 0;
		}
	}

	async getAccessToken(): Promise<string> {
		if (this.accessToken && Date.now() < this.tokenExpiry) {
			return this.accessToken;
		}

		if (!this.appId || !this.appSecret) {
			throw new Error('请先在插件设置中配置微信公众号的 AppID 和 AppSecret');
		}

		const url = `${WX_API_BASE}/token?grant_type=client_credential&appid=${encodeURIComponent(this.appId)}&secret=${encodeURIComponent(this.appSecret)}`;

		let response: RequestUrlResponse;
		try {
			response = await requestUrl({ url, method: 'GET' });
		} catch (e) {
			throw new Error(`获取 access_token 网络请求失败: ${e instanceof Error ? e.message : String(e)}`);
		}

		const data: WeChatTokenResult = response.json;

		if (data.errcode) {
			throw new Error(`获取 access_token 失败 (${data.errcode}): ${data.errmsg}`);
		}

		if (!data.access_token) {
			throw new Error('获取 access_token 失败: 返回数据中无 token');
		}

		this.accessToken = data.access_token;
		this.tokenExpiry = Date.now() + (data.expires_in || 7200) * 1000 - 300000;

		return this.accessToken;
	}

	async uploadImage(imageData: ArrayBuffer, filename: string): Promise<string> {
		const token = await this.getAccessToken();
		const url = `${WX_API_BASE}/media/uploadimg?access_token=${token}`;

		const result = await this.uploadMultipart(url, imageData, filename);

		if (result.errcode) {
			throw new Error(`上传图片失败 (${result.errcode}): ${result.errmsg}`);
		}

		if (!result.url) {
			throw new Error('上传图片失败: 返回数据中无 URL');
		}

		return result.url;
	}

	async uploadMaterial(imageData: ArrayBuffer, filename: string): Promise<string> {
		const token = await this.getAccessToken();
		const url = `${WX_API_BASE}/material/add_material?access_token=${token}&type=image`;

		const result = await this.uploadMultipart(url, imageData, filename);

		if (result.errcode) {
			throw new Error(`上传素材失败 (${result.errcode}): ${result.errmsg}`);
		}

		if (!result.media_id) {
			throw new Error('上传素材失败: 返回数据中无 media_id');
		}

		return result.media_id;
	}

	async addDraft(articles: WeChatDraftArticle[]): Promise<string> {
		const token = await this.getAccessToken();
		const url = `${WX_API_BASE}/draft/add?access_token=${token}`;

		let response: RequestUrlResponse;
		try {
			response = await requestUrl({
				url,
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ articles }),
			});
		} catch (e) {
			throw new Error(`创建草稿网络请求失败: ${e instanceof Error ? e.message : String(e)}`);
		}

		const data: WeChatDraftResult = response.json;

		if (data.errcode) {
			throw new Error(`创建草稿失败 (${data.errcode}): ${data.errmsg}`);
		}

		if (!data.media_id) {
			throw new Error('创建草稿失败: 返回数据中无 media_id');
		}

		return data.media_id;
	}

	private async uploadMultipart(url: string, data: ArrayBuffer, filename: string): Promise<WeChatUploadResult> {
		const boundary = '----WebKitFormBoundary' + this.randomString(16);
		const mimeType = this.getMimeType(filename);

		const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
		const suffix = `\r\n--${boundary}--\r\n`;

		const prefixBytes = new TextEncoder().encode(prefix);
		const suffixBytes = new TextEncoder().encode(suffix);
		const dataBytes = new Uint8Array(data);

		const body = new Uint8Array(prefixBytes.length + dataBytes.length + suffixBytes.length);
		body.set(prefixBytes, 0);
		body.set(dataBytes, prefixBytes.length);
		body.set(suffixBytes, prefixBytes.length + dataBytes.length);

		let response: RequestUrlResponse;
		try {
			response = await requestUrl({
				url,
				method: 'POST',
				headers: {
					'Content-Type': `multipart/form-data; boundary=${boundary}`,
				},
				body: body.buffer,
			});
		} catch (e) {
			throw new Error(`上传文件网络请求失败: ${e instanceof Error ? e.message : String(e)}`);
		}

		return response.json;
	}

	private randomString(length: number): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	private getMimeType(filename: string): string {
		const ext = filename.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'png': return 'image/png';
			case 'jpg':
			case 'jpeg': return 'image/jpeg';
			case 'gif': return 'image/gif';
			case 'webp': return 'image/webp';
			case 'bmp': return 'image/bmp';
			default: return 'application/octet-stream';
		}
	}
}
