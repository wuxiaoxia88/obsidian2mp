import { App, Notice, PluginSettingTab, Setting, requestUrl } from 'obsidian';
import type MPPublisherPlugin from './main';
import {
	PluginSettings,
	WeChatAccount,
	CoverStyle,
	CoverPalette,
	ArticleTheme,
	COVER_STYLE_LABELS,
	COVER_PALETTE_LABELS,
	ARTICLE_THEME_LABELS,
	GITHUB_REPO,
} from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
	wechatAccounts: [],
	activeAccountIndex: -1,
	defaultAuthor: '',
	defaultTheme: 'default',
	defaultCoverStyle: 'gradient',
	defaultCoverPalette: 'warm',
	convertLinksToFootnotes: true,
	coverSaveLocation: 'same',
	coverSubfolder: 'covers',
};

export function getActiveAccount(settings: PluginSettings): WeChatAccount | null {
	if (settings.activeAccountIndex >= 0 && settings.activeAccountIndex < settings.wechatAccounts.length) {
		return settings.wechatAccounts[settings.activeAccountIndex];
	}
	if (settings.wechatAccounts.length > 0) {
		return settings.wechatAccounts[0];
	}
	return null;
}

export class MPPublisherSettingTab extends PluginSettingTab {
	plugin: MPPublisherPlugin;

	constructor(app: App, plugin: MPPublisherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.renderUpdateSection(containerEl);
		this.renderAccountSection(containerEl);
		this.renderArticleSection(containerEl);
		this.renderCoverSection(containerEl);
	}

	private renderUpdateSection(containerEl: HTMLElement) {
		containerEl.createEl('h2', { text: '版本更新' });

		const currentVersion = this.plugin.manifest.version;

		new Setting(containerEl)
			.setName('当前版本')
			.setDesc(`v${currentVersion}`)
			.addButton((btn) =>
				btn
					.setButtonText('检查更新')
					.onClick(async () => {
						btn.setButtonText('检查中...');
						btn.setDisabled(true);
						try {
							const latest = await this.checkForUpdate();
							if (latest && latest !== currentVersion) {
								new Notice(`发现新版本 v${latest}！请前往 GitHub 下载更新。`);
								btn.setButtonText(`有新版本 v${latest}`);
								const link = containerEl.createEl('a', {
									text: `下载 v${latest}`,
									href: `https://github.com/${GITHUB_REPO}/releases/latest`,
									cls: 'mp-update-link',
								});
								link.setAttr('target', '_blank');
								btn.buttonEl.parentElement?.appendChild(link);
							} else {
								new Notice('已是最新版本！');
								btn.setButtonText('已是最新');
							}
						} catch (e) {
							new Notice(`检查更新失败: ${e instanceof Error ? e.message : String(e)}`);
							btn.setButtonText('检查更新');
						}
						btn.setDisabled(false);
					})
			);
	}

	private async checkForUpdate(): Promise<string | null> {
		try {
			const response = await requestUrl({
				url: `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
				method: 'GET',
				headers: { 'Accept': 'application/vnd.github.v3+json' },
			});
			const data = response.json;
			if (data.tag_name) {
				return data.tag_name.replace(/^v/, '');
			}
		} catch {
			const response = await requestUrl({
				url: `https://raw.githubusercontent.com/${GITHUB_REPO}/main/manifest.json`,
				method: 'GET',
			});
			const data = response.json;
			if (data.version) {
				return data.version;
			}
		}
		return null;
	}

	private renderAccountSection(containerEl: HTMLElement) {
		containerEl.createEl('h2', { text: '微信公众号账号' });

		const accounts = this.plugin.settings.wechatAccounts;

		if (accounts.length === 0) {
			containerEl.createEl('p', {
				text: '尚未配置公众号账号，请点击下方按钮添加。',
				cls: 'setting-item-description',
			});
		}

		accounts.forEach((account, index) => {
			const accountContainer = containerEl.createDiv({ cls: 'mp-account-item' });

			const isActive = index === this.plugin.settings.activeAccountIndex;

			new Setting(accountContainer)
				.setName(`${account.name || '未命名账号'}${isActive ? ' ✓' : ''}`)
				.setDesc(`AppID: ${account.appId ? account.appId.slice(0, 6) + '****' : '未配置'}`)
				.addButton((btn) =>
					btn
						.setButtonText(isActive ? '当前使用' : '切换')
						.setDisabled(isActive)
						.onClick(async () => {
							this.plugin.settings.activeAccountIndex = index;
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addButton((btn) =>
					btn
						.setButtonText('编辑')
						.onClick(() => {
							this.editAccount(containerEl, index);
						})
				)
				.addButton((btn) =>
					btn
						.setButtonText('删除')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.wechatAccounts.splice(index, 1);
							if (this.plugin.settings.activeAccountIndex >= this.plugin.settings.wechatAccounts.length) {
								this.plugin.settings.activeAccountIndex = this.plugin.settings.wechatAccounts.length - 1;
							}
							await this.plugin.saveSettings();
							this.display();
						})
				);
		});

		new Setting(containerEl)
			.addButton((btn) =>
				btn
					.setButtonText('+ 添加公众号')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.wechatAccounts.push({
							name: '',
							appId: '',
							appSecret: '',
						});
						const newIndex = this.plugin.settings.wechatAccounts.length - 1;
						if (this.plugin.settings.activeAccountIndex < 0) {
							this.plugin.settings.activeAccountIndex = 0;
						}
						await this.plugin.saveSettings();
						this.editAccount(containerEl, newIndex);
					})
			);
	}

	private editAccount(containerEl: HTMLElement, index: number) {
		const account = this.plugin.settings.wechatAccounts[index];
		if (!account) return;

		containerEl.empty();
		containerEl.createEl('h2', { text: '编辑公众号账号' });

		new Setting(containerEl)
			.setName('账号名称')
			.setDesc('给这个公众号起个名字，方便识别')
			.addText((text) =>
				text
					.setPlaceholder('例如：我的公众号')
					.setValue(account.name)
					.onChange(async (value) => {
						account.name = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('AppID')
			.setDesc('微信公众号的 AppID')
			.addText((text) =>
				text
					.setPlaceholder('请输入 AppID')
					.setValue(account.appId)
					.onChange(async (value) => {
						account.appId = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('AppSecret')
			.setDesc('微信公众号的 AppSecret')
			.addText((text) => {
				text
					.setPlaceholder('请输入 AppSecret')
					.setValue(account.appSecret)
					.onChange(async (value) => {
						account.appSecret = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.addButton((btn) =>
				btn
					.setButtonText('← 返回')
					.onClick(() => {
						this.display();
					})
			);
	}

	private renderArticleSection(containerEl: HTMLElement) {
		containerEl.createEl('h2', { text: '文章默认设置' });

		new Setting(containerEl)
			.setName('默认作者')
			.setDesc('发布文章时的默认作者名称')
			.addText((text) =>
				text
					.setPlaceholder('请输入作者名称')
					.setValue(this.plugin.settings.defaultAuthor)
					.onChange(async (value) => {
						this.plugin.settings.defaultAuthor = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('默认文章主题')
			.setDesc('Markdown 转 HTML 时使用的默认主题')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(ARTICLE_THEME_LABELS as unknown as Record<string, string>)
					.setValue(this.plugin.settings.defaultTheme)
					.onChange(async (value) => {
						this.plugin.settings.defaultTheme = value as ArticleTheme;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('外链转脚注')
			.setDesc('将外部链接转换为文末脚注（微信公众号不支持外链跳转）')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.convertLinksToFootnotes)
					.onChange(async (value) => {
						this.plugin.settings.convertLinksToFootnotes = value;
						await this.plugin.saveSettings();
					})
			);
	}

	private renderCoverSection(containerEl: HTMLElement) {
		containerEl.createEl('h2', { text: '封面图设置' });

		new Setting(containerEl)
			.setName('默认封面风格')
			.setDesc('生成封面图时的默认视觉风格')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(COVER_STYLE_LABELS as unknown as Record<string, string>)
					.setValue(this.plugin.settings.defaultCoverStyle)
					.onChange(async (value) => {
						this.plugin.settings.defaultCoverStyle = value as CoverStyle;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('默认配色方案')
			.setDesc('生成封面图时的默认配色方案')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(COVER_PALETTE_LABELS as unknown as Record<string, string>)
					.setValue(this.plugin.settings.defaultCoverPalette)
					.onChange(async (value) => {
						this.plugin.settings.defaultCoverPalette = value as CoverPalette;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('封面保存位置')
			.setDesc('封面图保存到当前笔记目录还是子文件夹')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						same: '当前笔记目录',
						subfolder: '子文件夹',
					})
					.setValue(this.plugin.settings.coverSaveLocation)
					.onChange(async (value) => {
						this.plugin.settings.coverSaveLocation = value as 'same' | 'subfolder';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('封面子文件夹名')
			.setDesc('当封面保存位置为"子文件夹"时使用的文件夹名')
			.addText((text) =>
				text
					.setPlaceholder('covers')
					.setValue(this.plugin.settings.coverSubfolder)
					.onChange(async (value) => {
						this.plugin.settings.coverSubfolder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
