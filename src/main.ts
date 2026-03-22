import { Plugin, TFile, Notice, MarkdownView, WorkspaceLeaf } from 'obsidian';
import { PluginSettings, WeChatAccount } from './types';
import { DEFAULT_SETTINGS, MPPublisherSettingTab, getActiveAccount } from './settings';
import { CoverModal } from './cover-modal';
import { PreviewModal } from './preview-modal';
import { PublishModal } from './publish-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { WeChatClient } from './wechat-client';
import { MPSidebarView, VIEW_TYPE_MP_SIDEBAR } from './sidebar-view';

export default class MPPublisherPlugin extends Plugin {
	settings: PluginSettings;
	wechatClient: WeChatClient;

	async onload() {
		await this.loadSettings();

		const account = getActiveAccount(this.settings);
		this.wechatClient = new WeChatClient(
			account?.appId || '',
			account?.appSecret || ''
		);

		this.registerView(
			VIEW_TYPE_MP_SIDEBAR,
			(leaf) => new MPSidebarView(leaf, this)
		);

		this.addRibbonIcon('upload-cloud', 'MP Publisher', () => {
			this.activateSidebar();
		});

		this.addCommand({
			id: 'open-sidebar',
			name: '打开侧边栏',
			callback: () => {
				this.activateSidebar();
			},
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

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_MP_SIDEBAR);
	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);

		if (loaded && !loaded.wechatAccounts && (loaded.wechatAppId || loaded.wechatAppSecret)) {
			this.settings.wechatAccounts = [{
				name: '默认公众号',
				appId: loaded.wechatAppId || '',
				appSecret: loaded.wechatAppSecret || '',
			}];
			this.settings.activeAccountIndex = 0;
			await this.saveData(this.settings);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
		const account = getActiveAccount(this.settings);
		this.wechatClient?.updateCredentials(
			account?.appId || '',
			account?.appSecret || ''
		);
	}

	async activateSidebar() {
		const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_MP_SIDEBAR);
		if (existing.length) {
			this.app.workspace.revealLeaf(existing[0]);
			const view = existing[0].view;
			if (view instanceof MPSidebarView) {
				view.renderPanel();
			}
			return;
		}

		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_MP_SIDEBAR,
				active: true,
			});
			this.app.workspace.revealLeaf(leaf);
		}
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
