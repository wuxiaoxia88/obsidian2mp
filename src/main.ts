import { Plugin, TFile, Notice, MarkdownView } from 'obsidian';
import { PluginSettings } from './types';
import { DEFAULT_SETTINGS, MPPublisherSettingTab } from './settings';
import { CoverModal } from './cover-modal';
import { PreviewModal } from './preview-modal';
import { PublishModal } from './publish-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { WeChatClient } from './wechat-client';

export default class MPPublisherPlugin extends Plugin {
	settings: PluginSettings;
	wechatClient: WeChatClient;

	async onload() {
		await this.loadSettings();

		this.wechatClient = new WeChatClient(
			this.settings.wechatAppId,
			this.settings.wechatAppSecret
		);

		this.addRibbonIcon('upload-cloud', 'MP Publisher', () => {
			this.publishCurrentFile();
		});

		this.addCommand({
			id: 'generate-cover',
			name: '生成封面图',
			checkCallback: (checking: boolean) => {
				const file = this.getActiveMarkdownFile();
				if (file) {
					if (!checking) this.generateCover(file);
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: 'preview-article',
			name: '预览文章排版',
			checkCallback: (checking: boolean) => {
				const file = this.getActiveMarkdownFile();
				if (file) {
					if (!checking) this.previewArticle(file);
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: 'publish-to-wechat',
			name: '发布到公众号草稿箱',
			checkCallback: (checking: boolean) => {
				const file = this.getActiveMarkdownFile();
				if (file) {
					if (!checking) this.publishCurrentFile();
					return true;
				}
				return false;
			},
		});

		this.addCommand({
			id: 'copy-styled-html',
			name: '复制排版后的 HTML',
			checkCallback: (checking: boolean) => {
				const file = this.getActiveMarkdownFile();
				if (file) {
					if (!checking) this.copyStyledHtml(file);
					return true;
				}
				return false;
			},
		});

		this.addSettingTab(new MPPublisherSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.wechatClient?.updateCredentials(
			this.settings.wechatAppId,
			this.settings.wechatAppSecret
		);
	}

	private getActiveMarkdownFile(): TFile | null {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		return view?.file ?? null;
	}

	private async generateCover(file: TFile) {
		const content = await this.app.vault.read(file);
		const renderer = new MarkdownRenderer(this.settings.defaultTheme, false);
		const title = renderer.extractTitle(content) || file.basename;

		new CoverModal(this.app, this.settings, file, title).open();
	}

	private async previewArticle(file: TFile) {
		const content = await this.app.vault.read(file);
		new PreviewModal(this.app, this.settings, content).open();
	}

	private async publishCurrentFile() {
		const file = this.getActiveMarkdownFile();
		if (!file) {
			new Notice('请先打开一个 Markdown 文件');
			return;
		}

		const content = await this.app.vault.read(file);
		new PublishModal(
			this.app,
			this.settings,
			file,
			content,
			this.wechatClient
		).open();
	}

	private async copyStyledHtml(file: TFile) {
		const content = await this.app.vault.read(file);
		const renderer = new MarkdownRenderer(
			this.settings.defaultTheme,
			this.settings.convertLinksToFootnotes
		);
		const html = renderer.render(content);

		try {
			const blob = new Blob([html], { type: 'text/html' });
			const plainBlob = new Blob([html], { type: 'text/plain' });
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/html': blob,
					'text/plain': plainBlob,
				}),
			]);
			new Notice('排版后的 HTML 已复制到剪贴板');
		} catch {
			try {
				await navigator.clipboard.writeText(html);
				new Notice('HTML 文本已复制到剪贴板');
			} catch (e) {
				new Notice(`复制失败: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	}
}
