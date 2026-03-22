import { App, Modal, Notice, TFile, Setting } from 'obsidian';
import { CoverGenerator } from './cover-generator';
import { MarkdownRenderer } from './markdown-renderer';
import { CoverStyle, CoverPalette, CoverOptions, COVER_STYLE_LABELS, COVER_PALETTE_LABELS, PluginSettings } from './types';

export class CoverModal extends Modal {
	private settings: PluginSettings;
	private file: TFile;
	private markdown: string;
	private generator: CoverGenerator;
	private previewEl: HTMLDivElement;
	private currentBlob: Blob | null = null;

	private selectedStyle: CoverStyle;
	private selectedPalette: CoverPalette;
	private customTitle: string;
	private subtitle: string;
	private author: string;
	private tags: string[];

	constructor(app: App, settings: PluginSettings, file: TFile, markdown: string) {
		super(app);
		this.settings = settings;
		this.file = file;
		this.markdown = markdown;
		this.generator = new CoverGenerator();
		this.selectedStyle = settings.defaultCoverStyle;
		this.selectedPalette = settings.defaultCoverPalette;

		const renderer = new MarkdownRenderer(settings.defaultTheme, false);
		this.customTitle = renderer.extractTitle(markdown) || file.basename;
		this.subtitle = renderer.extractDescription(markdown);
		this.author = renderer.extractAuthor(markdown) || settings.defaultAuthor;
		this.tags = this.extractTags(markdown);
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('mp-cover-modal');

		contentEl.createEl('h2', { text: '生成信息卡封面' });
		contentEl.createEl('p', {
			text: '基于文章内容生成社论风格信息卡（2.35:1）',
			cls: 'mp-modal-desc',
		});

		new Setting(contentEl)
			.setName('标题')
			.addText((text) =>
				text.setValue(this.customTitle).onChange((v) => { this.customTitle = v; })
			);

		new Setting(contentEl)
			.setName('副标题')
			.addText((text) =>
				text.setValue(this.subtitle).onChange((v) => { this.subtitle = v; })
			);

		new Setting(contentEl)
			.setName('作者')
			.addText((text) =>
				text.setValue(this.author).onChange((v) => { this.author = v; })
			);

		new Setting(contentEl)
			.setName('标签')
			.setDesc('用逗号分隔')
			.addText((text) =>
				text.setValue(this.tags.join(', ')).onChange((v) => {
					this.tags = v.split(',').map(s => s.trim()).filter(Boolean);
				})
			);

		new Setting(contentEl)
			.setName('卡片布局')
			.addDropdown((d) =>
				d.addOptions(COVER_STYLE_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedStyle)
					.onChange((v) => { this.selectedStyle = v as CoverStyle; })
			);

		new Setting(contentEl)
			.setName('配色方案')
			.addDropdown((d) =>
				d.addOptions(COVER_PALETTE_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedPalette)
					.onChange((v) => { this.selectedPalette = v as CoverPalette; })
			);

		const buttonRow = contentEl.createDiv({ cls: 'mp-button-row' });

		const previewBtn = buttonRow.createEl('button', { text: '预览' });
		previewBtn.addEventListener('click', () => this.generatePreview());

		const saveBtn = buttonRow.createEl('button', { text: '生成并保存', cls: 'mod-cta' });
		saveBtn.addEventListener('click', () => this.generateAndSave());

		this.previewEl = contentEl.createDiv({ cls: 'mp-cover-preview' });
		await this.generatePreview();
	}

	onClose() {
		this.contentEl.empty();
	}

	private getOptions(): CoverOptions {
		return {
			title: this.customTitle || '未命名文章',
			subtitle: this.subtitle || undefined,
			author: this.author || undefined,
			tags: this.tags.length > 0 ? this.tags : undefined,
			style: this.selectedStyle,
			palette: this.selectedPalette,
		};
	}

	private async generatePreview() {
		try {
			const options = this.getOptions();
			this.currentBlob = await this.generator.generate(options);
			this.previewEl.empty();

			const canvas = this.generator.getCanvas();
			const previewCanvas = this.previewEl.createEl('canvas');
			previewCanvas.width = canvas.width;
			previewCanvas.height = canvas.height;
			previewCanvas.addClass('mp-cover-canvas');
			const ctx = previewCanvas.getContext('2d');
			if (ctx) ctx.drawImage(canvas, 0, 0);

			const info = this.previewEl.createDiv({ cls: 'mp-cover-info' });
			info.createEl('span', { text: `${canvas.width} × ${canvas.height} (2.35:1)` });
		} catch (e) {
			this.previewEl.empty();
			this.previewEl.createEl('p', {
				text: `生成失败: ${e instanceof Error ? e.message : String(e)}`,
				cls: 'mp-error',
			});
		}
	}

	private async generateAndSave() {
		if (!this.currentBlob) {
			await this.generatePreview();
		}
		if (!this.currentBlob) {
			new Notice('封面图生成失败');
			return;
		}

		try {
			const buffer = await this.currentBlob.arrayBuffer();
			const coverName = this.file.basename + '-cover.png';
			let folderPath = this.file.parent?.path || '';

			if (this.settings.coverSaveLocation === 'subfolder') {
				const subFolder = this.settings.coverSubfolder || 'covers';
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

			new Notice(`封面图已保存: ${coverPath}`);
			this.close();
		} catch (e) {
			new Notice(`保存失败: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	private extractTags(markdown: string): string[] {
		const fm = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
		if (fm) {
			const tagsMatch = fm[1].match(/^tags:\s*\[([^\]]*)\]/m);
			if (tagsMatch) {
				return tagsMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
			}
			const tagsList = fm[1].match(/^tags:\s*\n((?:\s*-\s*.+\n?)*)/m);
			if (tagsList) {
				return tagsList[1].split('\n').map(s => s.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
			}
			const categories = fm[1].match(/^categor(?:y|ies):\s*(.+)$/m);
			if (categories) {
				return categories[1].split(',').map(s => s.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, '')).filter(Boolean);
			}
		}
		return [];
	}
}
