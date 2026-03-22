import { App, PluginSettingTab, Setting } from 'obsidian';
import type MPPublisherPlugin from './main';
import {
	PluginSettings,
	CoverStyle,
	CoverPalette,
	ArticleTheme,
	COVER_STYLE_LABELS,
	COVER_PALETTE_LABELS,
	ARTICLE_THEME_LABELS,
} from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
	wechatAppId: '',
	wechatAppSecret: '',
	defaultAuthor: '',
	defaultTheme: 'default',
	defaultCoverStyle: 'gradient',
	defaultCoverPalette: 'warm',
	convertLinksToFootnotes: true,
	coverSaveLocation: 'same',
	coverSubfolder: 'covers',
};

export class MPPublisherSettingTab extends PluginSettingTab {
	plugin: MPPublisherPlugin;

	constructor(app: App, plugin: MPPublisherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: '微信公众号设置' });

		new Setting(containerEl)
			.setName('AppID')
			.setDesc('微信公众号的 AppID')
			.addText((text) =>
				text
					.setPlaceholder('请输入 AppID')
					.setValue(this.plugin.settings.wechatAppId)
					.onChange(async (value) => {
						this.plugin.settings.wechatAppId = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('AppSecret')
			.setDesc('微信公众号的 AppSecret')
			.addText((text) => {
				text
					.setPlaceholder('请输入 AppSecret')
					.setValue(this.plugin.settings.wechatAppSecret)
					.onChange(async (value) => {
						this.plugin.settings.wechatAppSecret = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

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
