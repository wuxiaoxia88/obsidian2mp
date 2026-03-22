import { App, Modal, Setting } from 'obsidian';
import { MarkdownRenderer } from './markdown-renderer';
import { ArticleTheme, ARTICLE_THEME_LABELS, PluginSettings } from './types';

export class PreviewModal extends Modal {
	private settings: PluginSettings;
	private markdown: string;
	private previewEl: HTMLDivElement;
	private selectedTheme: ArticleTheme;

	constructor(app: App, settings: PluginSettings, markdown: string) {
		super(app);
		this.settings = settings;
		this.markdown = markdown;
		this.selectedTheme = settings.defaultTheme;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('mp-preview-modal');

		contentEl.createEl('h2', { text: '文章预览' });

		const controls = contentEl.createDiv({ cls: 'mp-preview-controls' });

		new Setting(controls)
			.setName('主题')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(ARTICLE_THEME_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedTheme)
					.onChange((value) => {
						this.selectedTheme = value as ArticleTheme;
						this.renderPreview();
					})
			);

		const buttonRow = controls.createDiv({ cls: 'mp-button-row' });
		const copyBtn = buttonRow.createEl('button', {
			text: '复制 HTML',
			cls: 'mod-cta',
		});
		copyBtn.addEventListener('click', () => this.copyHtml());

		this.previewEl = contentEl.createDiv({ cls: 'mp-article-preview' });
		this.renderPreview();
	}

	onClose() {
		this.contentEl.empty();
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

	private async copyHtml() {
		const renderer = new MarkdownRenderer(
			this.selectedTheme,
			this.settings.convertLinksToFootnotes
		);
		const html = renderer.render(this.markdown);

		try {
			const blob = new Blob([html], { type: 'text/html' });
			const plainBlob = new Blob([html], { type: 'text/plain' });
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/html': blob,
					'text/plain': plainBlob,
				}),
			]);

			const { Notice } = await import('obsidian');
			new Notice('HTML 已复制到剪贴板');
		} catch {
			try {
				await navigator.clipboard.writeText(html);
				const { Notice } = await import('obsidian');
				new Notice('HTML 文本已复制到剪贴板');
			} catch (e) {
				const { Notice } = await import('obsidian');
				new Notice(`复制失败: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
	}
}
