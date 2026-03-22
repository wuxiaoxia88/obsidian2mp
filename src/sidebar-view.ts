import { ItemView, WorkspaceLeaf, Setting, Notice, TFile, MarkdownView } from 'obsidian';
import type MPPublisherPlugin from './main';
import { MarkdownRenderer } from './markdown-renderer';
import { CoverGenerator } from './cover-generator';
import { WeChatClient } from './wechat-client';
import { getActiveAccount } from './settings';
import {
	ArticleTheme,
	CoverStyle,
	CoverPalette,
	WeChatAccount,
	WeChatDraftArticle,
	ARTICLE_THEME_LABELS,
	COVER_STYLE_LABELS,
	COVER_PALETTE_LABELS,
} from './types';

export const VIEW_TYPE_MP_SIDEBAR = 'mp-publisher-sidebar';

export class MPSidebarView extends ItemView {
	plugin: MPPublisherPlugin;

	private selectedTheme: ArticleTheme;
	private coverStyle: CoverStyle;
	private coverPalette: CoverPalette;
	private selectedAccountIndex: number;

	private coverPreviewEl: HTMLDivElement;
	private articlePreviewEl: HTMLDivElement;
	private statusEl: HTMLDivElement;

	constructor(leaf: WorkspaceLeaf, plugin: MPPublisherPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.selectedTheme = plugin.settings.defaultTheme;
		this.coverStyle = plugin.settings.defaultCoverStyle;
		this.coverPalette = plugin.settings.defaultCoverPalette;
		this.selectedAccountIndex = plugin.settings.activeAccountIndex;
	}

	getViewType(): string {
		return VIEW_TYPE_MP_SIDEBAR;
	}

	getDisplayText(): string {
		return 'MP Publisher';
	}

	getIcon(): string {
		return 'upload-cloud';
	}

	async onOpen() {
		this.renderPanel();
	}

	async onClose() {
		this.contentEl.empty();
	}

	renderPanel() {
		const container = this.contentEl;
		container.empty();
		container.addClass('mp-sidebar');

		const file = this.getActiveFile();
		if (!file) {
			container.createEl('p', { text: '请先打开一个 Markdown 文件', cls: 'mp-sidebar-empty' });
			return;
		}

		container.createEl('div', { text: file.basename, cls: 'mp-sidebar-filename' });

		this.renderAccountSelector(container);
		this.renderCoverSection(container);
		this.renderArticleSection(container);
		this.renderPublishSection(container);

		this.statusEl = container.createDiv({ cls: 'mp-status' });
	}

	private renderAccountSelector(container: HTMLElement) {
		const accounts = this.plugin.settings.wechatAccounts;
		if (accounts.length === 0) return;

		const section = container.createDiv({ cls: 'mp-sidebar-section' });
		section.createEl('div', { text: '公众号', cls: 'mp-sidebar-section-title' });

		const accountOptions: Record<string, string> = {};
		accounts.forEach((acc, i) => {
			accountOptions[String(i)] = acc.name || `账号 ${i + 1}`;
		});

		new Setting(section)
			.setName('选择账号')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(accountOptions)
					.setValue(String(this.selectedAccountIndex >= 0 ? this.selectedAccountIndex : 0))
					.onChange((value) => {
						this.selectedAccountIndex = parseInt(value);
					})
			);
	}

	private renderCoverSection(container: HTMLElement) {
		const section = container.createDiv({ cls: 'mp-sidebar-section' });
		section.createEl('div', { text: '封面图', cls: 'mp-sidebar-section-title' });

		new Setting(section)
			.setName('风格')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(COVER_STYLE_LABELS as unknown as Record<string, string>)
					.setValue(this.coverStyle)
					.onChange((value) => {
						this.coverStyle = value as CoverStyle;
					})
			);

		new Setting(section)
			.setName('配色')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(COVER_PALETTE_LABELS as unknown as Record<string, string>)
					.setValue(this.coverPalette)
					.onChange((value) => {
						this.coverPalette = value as CoverPalette;
					})
			);

		const btnRow = section.createDiv({ cls: 'mp-sidebar-btn-row' });

		const previewCoverBtn = btnRow.createEl('button', { text: '预览封面' });
		previewCoverBtn.addEventListener('click', () => this.previewCover());

		const saveCoverBtn = btnRow.createEl('button', { text: '保存封面', cls: 'mod-cta' });
		saveCoverBtn.addEventListener('click', () => this.saveCover());

		this.coverPreviewEl = section.createDiv({ cls: 'mp-sidebar-cover-preview' });
	}

	private renderArticleSection(container: HTMLElement) {
		const section = container.createDiv({ cls: 'mp-sidebar-section' });
		section.createEl('div', { text: '文章排版', cls: 'mp-sidebar-section-title' });

		new Setting(section)
			.setName('主题')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(ARTICLE_THEME_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedTheme)
					.onChange((value) => {
						this.selectedTheme = value as ArticleTheme;
					})
			);

		const btnRow = section.createDiv({ cls: 'mp-sidebar-btn-row' });

		const previewBtn = btnRow.createEl('button', { text: '预览' });
		previewBtn.addEventListener('click', () => this.previewArticle());

		const copyBtn = btnRow.createEl('button', { text: '复制 HTML', cls: 'mod-cta' });
		copyBtn.addEventListener('click', () => this.copyHtml());

		this.articlePreviewEl = section.createDiv({ cls: 'mp-sidebar-article-preview' });
	}

	private renderPublishSection(container: HTMLElement) {
		const section = container.createDiv({ cls: 'mp-sidebar-section' });
		section.createEl('div', { text: '发布', cls: 'mp-sidebar-section-title' });

		const publishBtn = section.createEl('button', {
			text: '发送到草稿箱',
			cls: 'mod-cta mp-sidebar-publish-btn',
		});
		publishBtn.addEventListener('click', () => this.publishToDraft());
	}

	private getActiveFile(): TFile | null {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		return view?.file ?? null;
	}

	private async getContent(): Promise<{ file: TFile; content: string } | null> {
		const file = this.getActiveFile();
		if (!file) {
			new Notice('请先打开一个 Markdown 文件');
			return null;
		}
		const content = await this.app.vault.read(file);
		return { file, content };
	}

	private async previewCover() {
		const result = await this.getContent();
		if (!result) return;

		const renderer = new MarkdownRenderer(this.selectedTheme, false);
		const title = renderer.extractTitle(result.content) || result.file.basename;

		const generator = new CoverGenerator();
		try {
			await generator.generate({
				title,
				style: this.coverStyle,
				palette: this.coverPalette,
			});

			this.coverPreviewEl.empty();
			const canvas = generator.getCanvas();
			const previewCanvas = this.coverPreviewEl.createEl('canvas');
			previewCanvas.width = canvas.width;
			previewCanvas.height = canvas.height;
			previewCanvas.addClass('mp-sidebar-canvas');
			const ctx = previewCanvas.getContext('2d');
			if (ctx) ctx.drawImage(canvas, 0, 0);
		} catch (e) {
			new Notice(`封面生成失败: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	private async saveCover() {
		const result = await this.getContent();
		if (!result) return;

		const renderer = new MarkdownRenderer(this.selectedTheme, false);
		const title = renderer.extractTitle(result.content) || result.file.basename;

		const generator = new CoverGenerator();
		try {
			const blob = await generator.generate({
				title,
				style: this.coverStyle,
				palette: this.coverPalette,
			});

			const buffer = await blob.arrayBuffer();
			const coverName = result.file.basename + '-cover.png';
			let folderPath = result.file.parent?.path || '';

			if (this.plugin.settings.coverSaveLocation === 'subfolder') {
				const subFolder = this.plugin.settings.coverSubfolder || 'covers';
				folderPath = folderPath ? `${folderPath}/${subFolder}` : subFolder;
				if (!this.app.vault.getAbstractFileByPath(folderPath)) {
					await this.app.vault.createFolder(folderPath);
				}
			}

			const coverPath = folderPath ? `${folderPath}/${coverName}` : coverName;
			const existing = this.app.vault.getAbstractFileByPath(coverPath);
			if (existing instanceof TFile) {
				await this.app.vault.modifyBinary(existing, buffer);
			} else {
				await this.app.vault.createBinary(coverPath, buffer);
			}

			new Notice(`封面已保存: ${coverPath}`);
		} catch (e) {
			new Notice(`保存失败: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	private async previewArticle() {
		const result = await this.getContent();
		if (!result) return;

		const renderer = new MarkdownRenderer(
			this.selectedTheme,
			this.plugin.settings.convertLinksToFootnotes
		);
		const html = renderer.render(result.content);

		this.articlePreviewEl.empty();
		const frame = this.articlePreviewEl.createDiv({ cls: 'mp-preview-frame' });
		frame.innerHTML = html;
	}

	private async copyHtml() {
		const result = await this.getContent();
		if (!result) return;

		const renderer = new MarkdownRenderer(
			this.selectedTheme,
			this.plugin.settings.convertLinksToFootnotes
		);
		const html = renderer.render(result.content);

		try {
			const blob = new Blob([html], { type: 'text/html' });
			const plainBlob = new Blob([html], { type: 'text/plain' });
			await navigator.clipboard.write([
				new ClipboardItem({ 'text/html': blob, 'text/plain': plainBlob }),
			]);
			new Notice('HTML 已复制到剪贴板');
		} catch {
			try {
				await navigator.clipboard.writeText(html);
				new Notice('HTML 文本已复制到剪贴板');
			} catch (e) {
				new Notice(`复制失败: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	}

	private setStatus(message: string, isError = false) {
		if (!this.statusEl) return;
		this.statusEl.empty();
		const el = this.statusEl.createEl('p', { text: message });
		el.addClass(isError ? 'mp-error' : 'mp-info');
	}

	private async publishToDraft() {
		const result = await this.getContent();
		if (!result) return;

		const accounts = this.plugin.settings.wechatAccounts;
		const accountIndex = this.selectedAccountIndex >= 0 ? this.selectedAccountIndex : 0;
		const account: WeChatAccount | undefined = accounts[accountIndex];

		if (!account || !account.appId || !account.appSecret) {
			this.setStatus('请先在插件设置中配置公众号账号', true);
			new Notice('请先在插件设置中配置公众号 AppID 和 AppSecret');
			return;
		}

		const client = new WeChatClient(account.appId, account.appSecret);
		const renderer = new MarkdownRenderer(
			this.selectedTheme,
			this.plugin.settings.convertLinksToFootnotes
		);

		const title = renderer.extractTitle(result.content) || result.file.basename;
		const author = renderer.extractAuthor(result.content) || this.plugin.settings.defaultAuthor;
		const digest = renderer.extractDescription(result.content);

		try {
			this.setStatus('正在获取 access_token...');
			await client.getAccessToken();

			this.setStatus('正在生成封面图...');
			const generator = new CoverGenerator();
			const coverBlob = await generator.generate({
				title,
				style: this.coverStyle,
				palette: this.coverPalette,
			});
			const coverData = await coverBlob.arrayBuffer();

			this.setStatus('正在上传封面...');
			const coverMediaId = await client.uploadMaterial(coverData, 'cover.png');

			this.setStatus('正在渲染文章...');
			let html = renderer.render(result.content);

			this.setStatus('正在上传图片...');
			html = await this.uploadContentImages(html, client);

			this.setStatus('正在创建草稿...');
			const article: WeChatDraftArticle = {
				title,
				author,
				digest,
				content: html,
				thumb_media_id: coverMediaId,
				need_open_comment: 0,
				only_fans_can_comment: 0,
			};

			const mediaId = await client.addDraft([article]);
			this.setStatus(`发布成功！(${mediaId})`);
			new Notice(`文章已发送到「${account.name || '公众号'}」草稿箱！`);
		} catch (e) {
			const errMsg = e instanceof Error ? e.message : String(e);
			this.setStatus(`发布失败: ${errMsg}`, true);
			new Notice(`发布失败: ${errMsg}`);
		}
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
