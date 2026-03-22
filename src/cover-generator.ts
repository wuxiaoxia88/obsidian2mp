import { CoverOptions, CoverPalette, CoverStyle, PaletteColors } from './types';

const PALETTES: Record<CoverPalette, PaletteColors> = {
	warm: {
		primary: '#FF6B35',
		secondary: '#F7931E',
		accent: '#FFD23F',
		background: '#1A1A2E',
		text: '#FFFFFF',
		gradientStops: ['#FF6B35', '#F7931E', '#FFD23F'],
	},
	cool: {
		primary: '#4ECDC4',
		secondary: '#556270',
		accent: '#88D8B0',
		background: '#1B2838',
		text: '#FFFFFF',
		gradientStops: ['#667eea', '#764ba2'],
	},
	dark: {
		primary: '#E94560',
		secondary: '#533483',
		accent: '#0F3460',
		background: '#16213E',
		text: '#FFFFFF',
		gradientStops: ['#16213E', '#0F3460', '#533483'],
	},
	elegant: {
		primary: '#C9A96E',
		secondary: '#826F66',
		accent: '#E8D5B7',
		background: '#2C3639',
		text: '#E8D5B7',
		gradientStops: ['#2C3639', '#3F4E4F', '#A27B5C'],
	},
	vivid: {
		primary: '#FF006E',
		secondary: '#8338EC',
		accent: '#3A86FF',
		background: '#0A0A23',
		text: '#FFFFFF',
		gradientStops: ['#FF006E', '#8338EC', '#3A86FF'],
	},
	mono: {
		primary: '#333333',
		secondary: '#888888',
		accent: '#CCCCCC',
		background: '#F5F5F5',
		text: '#1A1A1A',
		gradientStops: ['#E0E0E0', '#F5F5F5', '#FFFFFF'],
	},
	nature: {
		primary: '#2D6A4F',
		secondary: '#40916C',
		accent: '#95D5B2',
		background: '#1B4332',
		text: '#D8F3DC',
		gradientStops: ['#1B4332', '#2D6A4F', '#52B788'],
	},
	sunset: {
		primary: '#F72585',
		secondary: '#B5179E',
		accent: '#7209B7',
		background: '#3A0CA3',
		text: '#FFFFFF',
		gradientStops: ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#3A0CA3'],
	},
};

const FONT_FAMILY = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", "Helvetica Neue", Arial, sans-serif';

function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 16807 + 0) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0;
	}
	return Math.abs(hash);
}

export class CoverGenerator {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor() {
		this.canvas = document.createElement('canvas');
		const ctx = this.canvas.getContext('2d');
		if (!ctx) throw new Error('Cannot get 2d context');
		this.ctx = ctx;
	}

	async generate(options: CoverOptions): Promise<Blob> {
		const width = options.width || 1880;
		const height = options.height || 800;

		this.canvas.width = width;
		this.canvas.height = height;

		const palette = PALETTES[options.palette];
		const rand = seededRandom(hashString(options.title));

		this.ctx.clearRect(0, 0, width, height);

		switch (options.style) {
			case 'gradient':
				this.drawGradient(width, height, palette, rand);
				break;
			case 'geometric':
				this.drawGeometric(width, height, palette, rand);
				break;
			case 'minimal':
				this.drawMinimal(width, height, palette, rand);
				break;
			case 'wave':
				this.drawWave(width, height, palette, rand);
				break;
			case 'dots':
				this.drawDots(width, height, palette, rand);
				break;
			case 'blocks':
				this.drawBlocks(width, height, palette, rand);
				break;
		}

		this.drawTitle(width, height, options.title, options.subtitle, palette, options.style);

		return new Promise((resolve, reject) => {
			this.canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob);
					else reject(new Error('Failed to generate cover image'));
				},
				'image/png'
			);
		});
	}

	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	private drawGradient(w: number, h: number, p: PaletteColors, rand: () => number) {
		const angle = rand() * Math.PI * 0.5;
		const x1 = Math.cos(angle) * w;
		const y1 = Math.sin(angle) * h;
		const gradient = this.ctx.createLinearGradient(0, 0, x1, y1);
		const stops = p.gradientStops;
		stops.forEach((color, i) => {
			gradient.addColorStop(i / (stops.length - 1), color);
		});
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, w, h);

		for (let i = 0; i < 20; i++) {
			const x = rand() * w;
			const y = rand() * h;
			const r = 20 + rand() * 180;
			const alpha = 0.03 + rand() * 0.12;
			this.ctx.beginPath();
			this.ctx.arc(x, y, r, 0, Math.PI * 2);
			this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
			this.ctx.fill();
		}

		for (let i = 0; i < 8; i++) {
			const x = rand() * w;
			const y = rand() * h;
			const r = 40 + rand() * 120;
			const alpha = 0.05 + rand() * 0.1;
			const radGrad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
			radGrad.addColorStop(0, this.hexToRgba(p.primary, alpha));
			radGrad.addColorStop(1, this.hexToRgba(p.primary, 0));
			this.ctx.fillStyle = radGrad;
			this.ctx.fillRect(x - r, y - r, r * 2, r * 2);
		}
	}

	private drawGeometric(w: number, h: number, p: PaletteColors, rand: () => number) {
		this.ctx.fillStyle = p.background;
		this.ctx.fillRect(0, 0, w, h);

		const colors = [p.primary, p.secondary, p.accent];

		for (let i = 0; i < 25; i++) {
			const shape = Math.floor(rand() * 3);
			const x = rand() * w;
			const y = rand() * h;
			const size = 40 + rand() * 200;
			const alpha = 0.1 + rand() * 0.3;
			const color = colors[Math.floor(rand() * colors.length)];

			this.ctx.save();
			this.ctx.translate(x, y);
			this.ctx.rotate(rand() * Math.PI * 2);
			this.ctx.fillStyle = this.hexToRgba(color, alpha);

			if (shape === 0) {
				this.ctx.fillRect(-size / 2, -size / 2, size, size);
			} else if (shape === 1) {
				this.ctx.beginPath();
				this.ctx.moveTo(0, -size / 2);
				this.ctx.lineTo(size / 2, size / 2);
				this.ctx.lineTo(-size / 2, size / 2);
				this.ctx.closePath();
				this.ctx.fill();
			} else {
				this.ctx.beginPath();
				this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
				this.ctx.fill();
			}

			this.ctx.restore();
		}

		this.ctx.strokeStyle = this.hexToRgba(p.accent, 0.15);
		this.ctx.lineWidth = 1;
		const gridSize = 60;
		for (let x = 0; x < w; x += gridSize) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, 0);
			this.ctx.lineTo(x, h);
			this.ctx.stroke();
		}
		for (let y = 0; y < h; y += gridSize) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(w, y);
			this.ctx.stroke();
		}
	}

	private drawMinimal(w: number, h: number, p: PaletteColors, rand: () => number) {
		this.ctx.fillStyle = p.background;
		this.ctx.fillRect(0, 0, w, h);

		const lineY = h * 0.65;
		this.ctx.strokeStyle = p.primary;
		this.ctx.lineWidth = 4;
		this.ctx.beginPath();
		this.ctx.moveTo(w * 0.15, lineY);
		this.ctx.lineTo(w * 0.85, lineY);
		this.ctx.stroke();

		const dotR = 6;
		this.ctx.fillStyle = p.primary;
		this.ctx.beginPath();
		this.ctx.arc(w * 0.15, lineY, dotR, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.beginPath();
		this.ctx.arc(w * 0.85, lineY, dotR, 0, Math.PI * 2);
		this.ctx.fill();

		const cornerSize = 60;
		this.ctx.strokeStyle = this.hexToRgba(p.accent, 0.3);
		this.ctx.lineWidth = 2;

		this.ctx.beginPath();
		this.ctx.moveTo(40, 40 + cornerSize);
		this.ctx.lineTo(40, 40);
		this.ctx.lineTo(40 + cornerSize, 40);
		this.ctx.stroke();

		this.ctx.beginPath();
		this.ctx.moveTo(w - 40 - cornerSize, 40);
		this.ctx.lineTo(w - 40, 40);
		this.ctx.lineTo(w - 40, 40 + cornerSize);
		this.ctx.stroke();

		this.ctx.beginPath();
		this.ctx.moveTo(40, h - 40 - cornerSize);
		this.ctx.lineTo(40, h - 40);
		this.ctx.lineTo(40 + cornerSize, h - 40);
		this.ctx.stroke();

		this.ctx.beginPath();
		this.ctx.moveTo(w - 40 - cornerSize, h - 40);
		this.ctx.lineTo(w - 40, h - 40);
		this.ctx.lineTo(w - 40, h - 40 - cornerSize);
		this.ctx.stroke();
	}

	private drawWave(w: number, h: number, p: PaletteColors, rand: () => number) {
		const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
		gradient.addColorStop(0, p.background);
		gradient.addColorStop(1, this.adjustBrightness(p.background, 30));
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, w, h);

		const colors = [p.primary, p.secondary, p.accent];
		const waveCount = 4;

		for (let wave = 0; wave < waveCount; wave++) {
			const baseY = h * 0.4 + wave * (h * 0.15);
			const amplitude = 30 + rand() * 50;
			const frequency = 0.003 + rand() * 0.004;
			const phase = rand() * Math.PI * 2;
			const alpha = 0.15 + (waveCount - wave) * 0.08;

			this.ctx.beginPath();
			this.ctx.moveTo(0, h);

			for (let x = 0; x <= w; x += 4) {
				const y = baseY + Math.sin(x * frequency + phase) * amplitude
					+ Math.sin(x * frequency * 2.3 + phase * 1.5) * (amplitude * 0.3);
				if (x === 0) {
					this.ctx.lineTo(0, y);
				} else {
					this.ctx.lineTo(x, y);
				}
			}

			this.ctx.lineTo(w, h);
			this.ctx.closePath();
			this.ctx.fillStyle = this.hexToRgba(colors[wave % colors.length], alpha);
			this.ctx.fill();
		}
	}

	private drawDots(w: number, h: number, p: PaletteColors, rand: () => number) {
		this.ctx.fillStyle = p.background;
		this.ctx.fillRect(0, 0, w, h);

		const spacing = 50;
		const maxR = 12;
		const cx = w / 2;
		const cy = h / 2;
		const maxDist = Math.sqrt(cx * cx + cy * cy);

		for (let x = spacing; x < w; x += spacing) {
			for (let y = spacing; y < h; y += spacing) {
				const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
				const normalDist = dist / maxDist;
				const r = maxR * (0.3 + normalDist * 0.7);
				const alpha = 0.1 + (1 - normalDist) * 0.3;

				this.ctx.beginPath();
				this.ctx.arc(x, y, r, 0, Math.PI * 2);
				this.ctx.fillStyle = this.hexToRgba(
					normalDist > 0.5 ? p.accent : p.primary,
					alpha
				);
				this.ctx.fill();
			}
		}

		const radGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDist * 0.5);
		radGrad.addColorStop(0, this.hexToRgba(p.background, 0.9));
		radGrad.addColorStop(0.5, this.hexToRgba(p.background, 0.5));
		radGrad.addColorStop(1, this.hexToRgba(p.background, 0));
		this.ctx.fillStyle = radGrad;
		this.ctx.fillRect(0, 0, w, h);
	}

	private drawBlocks(w: number, h: number, p: PaletteColors, rand: () => number) {
		this.ctx.fillStyle = p.background;
		this.ctx.fillRect(0, 0, w, h);

		const colors = [p.primary, p.secondary, p.accent];
		const cols = 8;
		const rows = 4;
		const blockW = w / cols;
		const blockH = h / rows;

		for (let col = 0; col < cols; col++) {
			for (let row = 0; row < rows; row++) {
				if (rand() > 0.4) continue;
				const color = colors[Math.floor(rand() * colors.length)];
				const alpha = 0.15 + rand() * 0.4;
				this.ctx.fillStyle = this.hexToRgba(color, alpha);

				const bw = blockW * (1 + Math.floor(rand() * 2));
				const bh = blockH * (1 + Math.floor(rand() * 2));

				const roundness = 8 + rand() * 16;
				this.roundRect(
					col * blockW, row * blockH,
					Math.min(bw, w - col * blockW),
					Math.min(bh, h - row * blockH),
					roundness
				);
				this.ctx.fill();
			}
		}

		const overlay = this.ctx.createLinearGradient(0, 0, w, 0);
		overlay.addColorStop(0, this.hexToRgba(p.background, 0.3));
		overlay.addColorStop(0.5, this.hexToRgba(p.background, 0.6));
		overlay.addColorStop(1, this.hexToRgba(p.background, 0.3));
		this.ctx.fillStyle = overlay;
		this.ctx.fillRect(0, 0, w, h);
	}

	private drawTitle(
		w: number, h: number,
		title: string,
		subtitle: string | undefined,
		palette: PaletteColors,
		style: CoverStyle,
	) {
		const baseFontSize = Math.round(h * 0.085);
		let fontSize = baseFontSize;
		const maxWidth = w * 0.72;
		const maxLines = 3;

		this.ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';

		let lines = this.wrapText(title, maxWidth);
		while (lines.length > maxLines && fontSize > Math.round(h * 0.04)) {
			fontSize -= 2;
			this.ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
			lines = this.wrapText(title, maxWidth);
		}

		const lineHeight = fontSize * 1.45;
		const totalTextHeight = lines.length * lineHeight;
		const subtitleOffset = subtitle ? fontSize * 0.8 : 0;
		const startY = (h - totalTextHeight - subtitleOffset) / 2 + fontSize / 2;

		if (style !== 'minimal') {
			const padding = Math.round(h * 0.045);
			const bgWidth = maxWidth + padding * 2;
			const bgHeight = totalTextHeight + subtitleOffset + padding * 2;
			const bgX = (w - bgWidth) / 2;
			const bgY = startY - fontSize / 2 - padding;

			this.ctx.fillStyle = this.hexToRgba(palette.background, 0.35);
			this.roundRect(bgX, bgY, bgWidth, bgHeight, 16);
			this.ctx.fill();
		}

		this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
		this.ctx.shadowBlur = Math.round(h * 0.03);
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = Math.round(h * 0.005);
		this.ctx.fillStyle = palette.text;

		lines.forEach((line, i) => {
			this.ctx.fillText(line, w / 2, startY + i * lineHeight);
		});

		this.ctx.shadowColor = 'transparent';
		this.ctx.shadowBlur = 0;

		if (subtitle) {
			const subFontSize = Math.round(fontSize * 0.38);
			this.ctx.font = `${subFontSize}px ${FONT_FAMILY}`;
			this.ctx.fillStyle = this.hexToRgba(palette.text, 0.7);
			this.ctx.fillText(subtitle, w / 2, startY + totalTextHeight + subFontSize * 0.5);
		}
	}

	private wrapText(text: string, maxWidth: number): string[] {
		const lines: string[] = [];
		let currentLine = '';

		for (const char of text) {
			const testLine = currentLine + char;
			const metrics = this.ctx.measureText(testLine);

			if (metrics.width > maxWidth && currentLine.length > 0) {
				lines.push(currentLine);
				currentLine = char;
			} else {
				currentLine = testLine;
			}
		}

		if (currentLine) {
			lines.push(currentLine);
		}

		return lines;
	}

	private hexToRgba(hex: string, alpha: number): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	private adjustBrightness(hex: string, amount: number): string {
		const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
		const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
		const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	private roundRect(x: number, y: number, w: number, h: number, r: number) {
		this.ctx.beginPath();
		this.ctx.moveTo(x + r, y);
		this.ctx.lineTo(x + w - r, y);
		this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		this.ctx.lineTo(x + w, y + h - r);
		this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		this.ctx.lineTo(x + r, y + h);
		this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		this.ctx.lineTo(x, y + r);
		this.ctx.quadraticCurveTo(x, y, x + r, y);
		this.ctx.closePath();
	}
}
