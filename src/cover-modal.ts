import { App, Modal, Notice, TFile, Setting } from 'obsidian';
import { CoverGenerator } from './cover-generator';
import { CoverStyle, CoverPalette, CoverOptions, COVER_STYLE_LABELS, COVER_PALETTE_LABELS, PluginSettings } from './types';

export class CoverModal extends Modal {
	private settings: PluginSettings;
	private file: TFile;
	private title: string;
	private generator: CoverGenerator;
	private previewEl: HTMLDivElement;
	private currentBlob: Blob | null = null;

	private selectedStyle: CoverStyle;
	private selectedPalette: CoverPalette;
	private customTitle: string;

	constructor(app: App, settings: PluginSettings, file: TFile, title: string) {
		super(app);
		this.settings = settings;
		this.file = file;
		this.title = title;
		this.generator = new CoverGenerator();
		this.selectedStyle = settings.defaultCoverStyle;
		this.selectedPalette = settings.defaultCoverPalette;
		this.customTitle = title;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('mp-cover-modal');

		contentEl.createEl('h2', { text: '生成封面图' });
		contentEl.createEl('p', {
			text: '为文章生成 2.35:1 比例的封面图',
			cls: 'mp-modal-desc',
		});

		new Setting(contentEl)
			.setName('标题')
			.setDesc('显示在封面上的标题文字')
			.addText((text) =>
				text
					.setValue(this.customTitle)
					.onChange((value) => {
						this.customTitle = value;
					})
			);

		new Setting(contentEl)
			.setName('视觉风格')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(COVER_STYLE_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedStyle)
					.onChange((value) => {
						this.selectedStyle = value as CoverStyle;
					})
			);

		new Setting(contentEl)
			.setName('配色方案')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(COVER_PALETTE_LABELS as unknown as Record<string, string>)
					.setValue(this.selectedPalette)
					.onChange((value) => {
						this.selectedPalette = value as CoverPalette;
					})
			);

		const buttonRow = contentEl.createDiv({ cls: 'mp-button-row' });

		const previewBtn = buttonRow.createEl('button', { text: '预览' });
		previewBtn.addEventListener('click', () => this.generatePreview());

		const saveBtn = buttonRow.createEl('button', {
			text: '生成并保存',
			cls: 'mod-cta',
		});
		saveBtn.addEventListener('click', () => this.generateAndSave());

		this.previewEl = contentEl.createDiv({ cls: 'mp-cover-preview' });
		this.previewEl.createEl('p', {
			text: '点击"预览"查看封面效果',
			cls: 'mp-preview-placeholder',
		});

		await this.generatePreview();
	}

	onClose() {
		this.contentEl.empty();
	}

	private async generatePreview() {
		const options: CoverOptions = {
			title: this.customTitle || '未命名文章',
			style: this.selectedStyle,
			palette: this.selectedPalette,
		};

		try {
			this.currentBlob = await this.generator.generate(options);
			this.previewEl.empty();

			const canvas = this.generator.getCanvas();
			const previewCanvas = this.previewEl.createEl('canvas');
			previewCanvas.width = canvas.width;
			previewCanvas.height = canvas.height;
			previewCanvas.addClass('mp-cover-canvas');
			const ctx = previewCanvas.getContext('2d');
			if (ctx) {
				ctx.drawImage(canvas, 0, 0);
			}

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
}
