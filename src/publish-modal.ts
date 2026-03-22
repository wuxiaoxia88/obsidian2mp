import { App, Modal, Notice, Setting, TFile } from 'obsidian';
import { MarkdownRenderer } from './markdown-renderer';
import { CoverGenerator } from './cover-generator';
import { WeChatClient } from './wechat-client';
import { getActiveAccount } from './settings';
import {
	PluginSettings,
	ArticleTheme,
	CoverStyle,
	CoverPalette,
	ARTICLE_THEME_LABELS,
	COVER_STYLE_LABELS,
	COVER_PALETTE_LABELS,
	WeChatDraftArticle,
} from './types';

export class PublishModal extends Modal {
	private settings: PluginSettings;
	private file: TFile;
	private markdown: string;
	private wechatClient: WeChatClient;

	private articleTitle: string;
	private articleAuthor: string;
	private articleDigest: string;
	private selectedTheme: ArticleTheme;
	private coverStyle: CoverStyle;
	private coverPalette: CoverPalette;
	private coverSource: 'generate' | 'local' = 'generate';
	private localCoverFile: TFile | null = null;
	private selectedAccountIndex: number;

	private statusEl: HTMLDivElement;
	private previewEl: HTMLDivElement;

	constructor(
		app: App,
		settings: PluginSettings,
		file: TFile,
		markdown: string,
		wechatClient: WeChatClient,
	) {
		super(app);
		this.settings = settings;
		this.file = file;
		this.markdown = markdown;
		this.wechatClient = wechatClient;

		const renderer = new MarkdownRenderer(settings.defaultTheme, settings.convertLinksToFootnotes);
		this.articleTitle = renderer.extractTitle(markdown) || file.basename;
		this.articleAuthor = renderer.extractAuthor(markdown) || settings.defaultAuthor;
		this.articleDigest = renderer.extractDescription(markdown);
		this.selectedTheme = settings.defaultTheme;
		this.coverStyle = settings.defaultCoverStyle;
		this.coverPalette = settings.defaultCoverPalette;
		this.selectedAccountIndex = settings.activeAccountIndex;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('mp-publish-modal');

		contentEl.createEl('h2', { text: '发布到微信公众号' });

		const form = contentEl.createDiv({ cls: 'mp-publish-form' });

		const accounts = this.settings.wechatAccounts;
		if (accounts.length > 1) {
			const accountOptions: Record<string, string> = {};
			accounts.forEach((acc, i) => {
				accountOptions[String(i)] = acc.name || `账号 ${i + 1}`;
			});

			new Setting(form)
				.setName('选择公众号')
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(accountOptions)
						.setValue(String(this.selectedAccountIndex >= 0 ? this.selectedAccountIndex : 0))
						.onChange((value) => {
							this.selectedAccountIndex = parseInt(value);
						})
				);
		}

		new Setting(form)
			.setName('文章标题')
			.addText((text) =>
				text
					.setValue(this.articleTitle)
					.onChange((value) => { this.articleTitle = value; })
			);

		new Setting(form)
			.setName('作者')
			.addText((text) =>
				text
					.setValue(this.articleAuthor)
					.onChange((value) => { this.articleAuthor = value; })
			);

		new Setting(form)
			.setName('摘要')
			.setDesc('文章摘要，显示在公众号消息列表中')
			.addTextArea((textarea) => {
				textarea
					.setValue(this.articleDigest)
					.onChange((value) => { this.articleDigest = value; });
				textarea.inputEl.rows = 3;
			});

		new Setting(form)
			.setName('文章主题')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(ARTICLE_THEME_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedTheme)
					.onChange((value) => {
						this.selectedTheme = value as ArticleTheme;
						this.renderPreview();
					})
			);

		form.createEl('h3', { text: '封面设置', cls: 'mp-section-title' });

		new Setting(form)
			.setName('封面来源')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						generate: '自动生成',
						local: '选择本地图片',
					})
					.setValue(this.coverSource)
					.onChange((value) => {
						this.coverSource = value as 'generate' | 'local';
						this.updateCoverOptions(form);
					})
			);

		this.createCoverOptions(form);

		const buttonRow = contentEl.createDiv({ cls: 'mp-button-row' });

		const publishBtn = buttonRow.createEl('button', {
			text: '发送到草稿箱',
			cls: 'mod-cta',
		});
		publishBtn.addEventListener('click', () => this.publish());

		const cancelBtn = buttonRow.createEl('button', { text: '取消' });
		cancelBtn.addEventListener('click', () => this.close());

		this.statusEl = contentEl.createDiv({ cls: 'mp-status' });
		this.previewEl = contentEl.createDiv({ cls: 'mp-publish-preview' });
		this.renderPreview();
	}

	onClose() {
		this.contentEl.empty();
	}

	private coverOptionsEl: HTMLDivElement | null = null;

	private createCoverOptions(container: HTMLElement) {
		if (this.coverOptionsEl) {
			this.coverOptionsEl.remove();
		}
		this.coverOptionsEl = container.createDiv({ cls: 'mp-cover-options' });
		this.renderCoverOptions();
	}

	private updateCoverOptions(_container: HTMLElement) {
		if (this.coverOptionsEl) {
			this.coverOptionsEl.empty();
			this.renderCoverOptions();
		}
	}

	private renderCoverOptions() {
		if (!this.coverOptionsEl) return;

		if (this.coverSource === 'generate') {
			new Setting(this.coverOptionsEl)
				.setName('封面风格')
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(COVER_STYLE_LABELS as unknown as Record<string, string>)
						.setValue(this.coverStyle)
						.onChange((value) => { this.coverStyle = value as CoverStyle; })
				);

			new Setting(this.coverOptionsEl)
				.setName('配色方案')
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(COVER_PALETTE_LABELS as unknown as Record<string, string>)
						.setValue(this.coverPalette)
						.onChange((value) => { this.coverPalette = value as CoverPalette; })
				);
		} else {
			const imageFiles = this.app.vault.getFiles().filter(f =>
				/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f.extension)
			);

			if (imageFiles.length > 0) {
				new Setting(this.coverOptionsEl)
					.setName('选择封面图片')
					.setDesc('从 Vault 中选择一张图片')
					.addDropdown((dropdown) => {
						dropdown.addOption('', '请选择图片...');
						for (const img of imageFiles.slice(0, 100)) {
							dropdown.addOption(img.path, img.path);
						}
						dropdown.onChange((value) => {
							if (value) {
								const f = this.app.vault.getAbstractFileByPath(value);
								if (f instanceof TFile) {
									this.localCoverFile = f;
								}
							}
						});
					});
			}
		}
	}

	private renderPreview() {
		const renderer = new MarkdownRenderer(
			this.selectedTheme,
			this.settings.convertLinksToFootnotes
		);
		const html = renderer.render(this.markdown);

		this.previewEl.empty();
		const frame = this.previewEl.createDiv({ cls: 'mp-preview-frame' });
		frame.innerHTML = html;
	}

	private setStatus(message: string, isError = false) {
		this.statusEl.empty();
		const el = this.statusEl.createEl('p', { text: message });
		if (isError) el.addClass('mp-error');
		else el.addClass('mp-info');
	}

	private async publish() {
		const accounts = this.settings.wechatAccounts;
		const accountIndex = this.selectedAccountIndex >= 0 ? this.selectedAccountIndex : 0;
		const account = accounts[accountIndex];

		if (!account || !account.appId || !account.appSecret) {
			this.setStatus('请先在插件设置中配置公众号 AppID 和 AppSecret', true);
			return;
		}

		const client = new WeChatClient(account.appId, account.appSecret);

		try {
			this.setStatus('正在获取 access_token...');
			await client.getAccessToken();

			this.setStatus('正在准备封面图...');
			const coverMediaId = await this.prepareCover(client);

			this.setStatus('正在渲染文章...');
			const renderer = new MarkdownRenderer(
				this.selectedTheme,
				this.settings.convertLinksToFootnotes
			);
			let html = renderer.render(this.markdown);

			this.setStatus('正在上传文章图片...');
			html = await this.uploadContentImages(html, client);

			this.setStatus('正在创建草稿...');
			const article: WeChatDraftArticle = {
				title: this.articleTitle,
				author: this.articleAuthor,
				digest: this.articleDigest,
				content: html,
				thumb_media_id: coverMediaId,
				need_open_comment: 0,
				only_fans_can_comment: 0,
			};

			const mediaId = await client.addDraft([article]);
			this.setStatus(`草稿创建成功！(media_id: ${mediaId})`);
			new Notice(`文章已发送到「${account.name || '公众号'}」草稿箱！`);
		} catch (e) {
			const errMsg = e instanceof Error ? e.message : String(e);
			this.setStatus(`发布失败: ${errMsg}`, true);
			new Notice(`发布失败: ${errMsg}`);
		}
	}

	private async prepareCover(client: WeChatClient): Promise<string> {
		let coverData: ArrayBuffer;
		let coverFilename: string;

		if (this.coverSource === 'local' && this.localCoverFile) {
			coverData = await this.app.vault.readBinary(this.localCoverFile);
			coverFilename = this.localCoverFile.name;
		} else {
			const generator = new CoverGenerator();
			const blob = await generator.generate({
				title: this.articleTitle,
				style: this.coverStyle,
				palette: this.coverPalette,
			});
			coverData = await blob.arrayBuffer();
			coverFilename = 'cover.png';
		}

		return await client.uploadMaterial(coverData, coverFilename);
	}

	private async uploadContentImages(html: string, client: WeChatClient): Promise<string> {
		const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
		let match;
		const replacements: { original: string; newUrl: string }[] = [];

		while ((match = imgRegex.exec(html)) !== null) {
			const src = match[1];
			if (src.startsWith('http://') || src.startsWith('https://')) continue;

			try {
				const file = this.app.vault.getAbstractFileByPath(src);
				if (file instanceof TFile) {
					const data = await this.app.vault.readBinary(file);
					const wxUrl = await client.uploadImage(data, file.name);
					replacements.push({ original: src, newUrl: wxUrl });
				}
			} catch (e) {
				console.warn(`Failed to upload image ${src}:`, e);
			}
		}

		for (const r of replacements) {
			html = html.split(r.original).join(r.newUrl);
		}

		return html;
	}
}
