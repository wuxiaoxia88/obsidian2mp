import { CoverOptions, CoverPalette, CoverStyle, CardPaletteColors } from './types';

const SERIF = '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", Georgia, "Times New Roman", serif';
const SANS = '"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif';

const PALETTES: Record<CoverPalette, CardPaletteColors> = {
	classic: {
		paper: '#f5f3ed',
		paperDeep: '#ebe7dc',
		ink: '#111111',
		muted: '#575757',
		accent: '#111111',
		tint: 'rgba(0,0,0,0.035)',
		line: 'rgba(17,17,17,0.18)',
	},
	warm: {
		paper: '#f3efe6',
		paperDeep: '#e6dece',
		ink: '#111111',
		muted: '#5f5a52',
		accent: '#b45f2d',
		tint: 'rgba(180,95,45,0.05)',
		line: 'rgba(17,17,17,0.18)',
	},
	cool: {
		paper: '#edf2f7',
		paperDeep: '#dbe4ef',
		ink: '#1a202c',
		muted: '#4a5568',
		accent: '#2b6cb0',
		tint: 'rgba(43,108,176,0.06)',
		line: 'rgba(26,32,44,0.15)',
	},
	dark: {
		paper: '#1a1a2e',
		paperDeep: '#16213e',
		ink: '#e8e8e8',
		muted: '#a0a0b0',
		accent: '#e94560',
		tint: 'rgba(233,69,96,0.08)',
		line: 'rgba(255,255,255,0.12)',
	},
	nature: {
		paper: '#f0f5ef',
		paperDeep: '#dde8db',
		ink: '#1b4332',
		muted: '#52796f',
		accent: '#2d6a4f',
		tint: 'rgba(45,106,79,0.06)',
		line: 'rgba(27,67,50,0.15)',
	},
	vivid: {
		paper: '#fef5f5',
		paperDeep: '#fde8e8',
		ink: '#1a1a1a',
		muted: '#666666',
		accent: '#c53030',
		tint: 'rgba(197,48,48,0.05)',
		line: 'rgba(26,26,26,0.12)',
	},
};

function escXml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s: string, max: number): string {
	if (s.length <= max) return s;
	return s.slice(0, max - 1) + '…';
}

function today(): string {
	const d = new Date();
	return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function titleFontSize(title: string, w: number): number {
	const base = Math.round(w * 0.045);
	if (title.length > 30) return Math.round(base * 0.72);
	if (title.length > 20) return Math.round(base * 0.82);
	if (title.length > 12) return Math.round(base * 0.92);
	return base;
}

export class CoverGenerator {
	private lastHtml = '';
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor() {
		this.canvas = document.createElement('canvas');
		const ctx = this.canvas.getContext('2d');
		if (!ctx) throw new Error('Cannot get 2d context');
		this.ctx = ctx;
	}

	async generate(options: CoverOptions): Promise<Blob> {
		const w = options.width || 1880;
		const h = options.height || 800;
		const html = this.generateHtml(options, w, h);
		this.lastHtml = html;
		return this.htmlToImage(html, w, h);
	}

	generateHtml(options: CoverOptions, w?: number, h?: number): string {
		const width = w || options.width || 1880;
		const height = h || options.height || 800;
		const p = PALETTES[options.palette];

		switch (options.style) {
			case 'editorial':
				return this.buildEditorial(options, p, width, height);
			case 'magazine':
				return this.buildMagazine(options, p, width, height);
			case 'minimal':
				return this.buildMinimal(options, p, width, height);
			case 'panel':
				return this.buildPanel(options, p, width, height);
		}
	}

	getHtml(): string {
		return this.lastHtml;
	}

	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	createPreviewElement(html: string, containerWidth: number): HTMLDivElement {
		const div = document.createElement('div');
		div.style.cssText = 'overflow:hidden; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.1);';
		const inner = document.createElement('div');
		const scale = containerWidth / 1880;
		inner.style.cssText = `transform:scale(${scale}); transform-origin:top left; width:1880px; height:800px;`;
		inner.innerHTML = html;
		div.style.width = containerWidth + 'px';
		div.style.height = Math.round(800 * scale) + 'px';
		div.appendChild(inner);
		return div;
	}

	private buildEditorial(o: CoverOptions, p: CardPaletteColors, w: number, h: number): string {
		const fs = titleFontSize(o.title, w);
		const meta = o.author ? escXml(o.author) + ' · ' + today() : today();
		const subtitle = o.subtitle ? escXml(truncate(o.subtitle, 100)) : '';
		const tags = (o.tags || []).slice(0, 4);

		return `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;background:${p.paper};font-family:${SANS};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">` +
			`<div style="width:${Math.round(w * 0.82)}px;max-height:${Math.round(h * 0.85)}px;padding:${Math.round(h * 0.06)}px ${Math.round(w * 0.04)}px;">` +
			`<div style="font-size:${Math.round(w * 0.007)}px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${p.muted};margin-bottom:${Math.round(h * 0.02)}px;">${escXml(meta)}</div>` +
			`<div style="font-family:${SERIF};font-size:${fs}px;font-weight:900;line-height:1.1;letter-spacing:-0.03em;color:${p.ink};margin-bottom:${Math.round(h * 0.025)}px;">${escXml(o.title)}</div>` +
			`<div style="width:${Math.round(w * 0.06)}px;height:${Math.round(h * 0.008)}px;background:${p.accent};margin-bottom:${Math.round(h * 0.03)}px;"></div>` +
			(subtitle ? `<div style="font-size:${Math.round(w * 0.012)}px;line-height:1.55;color:${p.ink};max-width:${Math.round(w * 0.6)}px;margin-bottom:${Math.round(h * 0.03)}px;">${subtitle}</div>` : '') +
			(tags.length > 0 ? `<div style="display:flex;gap:${Math.round(w * 0.006)}px;flex-wrap:wrap;">` + tags.map(t =>
				`<span style="padding:${Math.round(h * 0.01)}px ${Math.round(w * 0.008)}px;border:1px solid ${p.line};font-size:${Math.round(w * 0.006)}px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${p.muted};">${escXml(t)}</span>`
			).join('') + `</div>` : '') +
			`</div>` +
			`</div>`;
	}

	private buildMagazine(o: CoverOptions, p: CardPaletteColors, w: number, h: number): string {
		const fs = titleFontSize(o.title, w);
		const meta = o.author ? escXml(o.author) : 'ARTICLE';
		const subtitle = o.subtitle ? escXml(truncate(o.subtitle, 120)) : '';
		const tags = (o.tags || []).slice(0, 5);

		const leftW = Math.round(w * 0.58);
		const rightW = Math.round(w * 0.32);
		const pad = Math.round(w * 0.035);
		const gap = Math.round(w * 0.025);

		return `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;background:${p.paper};font-family:${SANS};display:flex;overflow:hidden;position:relative;">` +
			// Left column
			`<div style="width:${leftW}px;padding:${pad}px ${gap}px ${pad}px ${pad}px;display:flex;flex-direction:column;justify-content:space-between;">` +
			`<div>` +
			`<div style="display:flex;align-items:center;gap:${Math.round(w * 0.008)}px;margin-bottom:${Math.round(h * 0.03)}px;">` +
			`<div style="width:${Math.round(w * 0.045)}px;height:${Math.round(h * 0.008)}px;background:${p.ink};"></div>` +
			`<span style="font-size:${Math.round(w * 0.007)}px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${p.muted};">${meta}</span>` +
			`</div>` +
			`<div style="font-family:${SERIF};font-size:${fs}px;font-weight:900;line-height:1.05;letter-spacing:-0.04em;color:${p.ink};">${escXml(o.title)}</div>` +
			(subtitle ? `<div style="font-size:${Math.round(w * 0.012)}px;line-height:1.5;color:${p.ink};margin-top:${Math.round(h * 0.025)}px;max-width:${Math.round(leftW * 0.9)}px;">${subtitle}</div>` : '') +
			`</div>` +
			(tags.length > 0 ? `<div style="display:flex;gap:${Math.round(w * 0.005)}px;flex-wrap:wrap;">` + tags.map(t =>
				`<span style="padding:${Math.round(h * 0.01)}px ${Math.round(w * 0.007)}px;border:1px solid ${p.line};font-size:${Math.round(w * 0.006)}px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${p.muted};">${escXml(t)}</span>`
			).join('') + `</div>` : `<div style="font-size:${Math.round(w * 0.007)}px;color:${p.muted};">${today()}</div>`) +
			`</div>` +
			// Right column
			`<div style="width:${rightW}px;padding:${Math.round(pad * 0.8)}px;border-left:${Math.round(h * 0.008)}px solid ${p.ink};background:linear-gradient(180deg,rgba(255,255,255,0.3),${p.tint});display:flex;flex-direction:column;justify-content:space-between;">` +
			`<div>` +
			`<div style="font-size:${Math.round(w * 0.007)}px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${p.accent};margin-bottom:${Math.round(h * 0.015)}px;">OVERVIEW</div>` +
			`<div style="font-size:${Math.round(w * 0.018)}px;font-weight:800;line-height:1.1;letter-spacing:-0.03em;color:${p.ink};margin-bottom:${Math.round(h * 0.02)}px;">${escXml(truncate(o.title, 20))}</div>` +
			(subtitle ? `<div style="font-size:${Math.round(w * 0.0095)}px;line-height:1.5;color:${p.ink};">${escXml(truncate(o.subtitle || '', 80))}</div>` : '') +
			`</div>` +
			`<div>` +
			`<div style="padding-top:${Math.round(h * 0.015)}px;border-top:1px solid ${p.line};margin-bottom:${Math.round(h * 0.015)}px;">` +
			`<div style="font-size:${Math.round(w * 0.006)}px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${p.muted};margin-bottom:${Math.round(h * 0.005)}px;">DATE</div>` +
			`<div style="font-size:${Math.round(w * 0.0095)}px;font-weight:700;color:${p.ink};">${today()}</div>` +
			`</div>` +
			(o.author ? `<div style="padding-top:${Math.round(h * 0.015)}px;border-top:1px solid ${p.line};">` +
				`<div style="font-size:${Math.round(w * 0.006)}px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${p.muted};margin-bottom:${Math.round(h * 0.005)}px;">AUTHOR</div>` +
				`<div style="font-size:${Math.round(w * 0.0095)}px;font-weight:700;color:${p.ink};">${escXml(o.author)}</div>` +
				`</div>` : '') +
			`</div>` +
			`</div>` +
			`</div>`;
	}

	private buildMinimal(o: CoverOptions, p: CardPaletteColors, w: number, h: number): string {
		let fs = Math.round(w * 0.055);
		if (o.title.length > 20) fs = Math.round(w * 0.042);
		if (o.title.length > 30) fs = Math.round(w * 0.035);

		const meta = o.author || '';

		return `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;background:${p.paper};font-family:${SANS};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">` +
			`<div style="text-align:center;max-width:${Math.round(w * 0.75)}px;">` +
			(meta ? `<div style="font-size:${Math.round(w * 0.007)}px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${p.muted};margin-bottom:${Math.round(h * 0.04)}px;">${escXml(meta)}</div>` : '') +
			`<div style="font-family:${SERIF};font-size:${fs}px;font-weight:900;line-height:1.05;letter-spacing:-0.04em;color:${p.ink};">${escXml(o.title)}</div>` +
			`<div style="width:${Math.round(w * 0.06)}px;height:${Math.round(h * 0.008)}px;background:${p.accent};margin:${Math.round(h * 0.04)}px auto;"></div>` +
			(o.subtitle ? `<div style="font-size:${Math.round(w * 0.011)}px;line-height:1.5;color:${p.muted};max-width:${Math.round(w * 0.5)}px;margin:0 auto;">${escXml(truncate(o.subtitle, 60))}</div>` : '') +
			`</div>` +
			`</div>`;
	}

	private buildPanel(o: CoverOptions, p: CardPaletteColors, w: number, h: number): string {
		const fs = titleFontSize(o.title, w);
		const subtitle = o.subtitle ? escXml(truncate(o.subtitle, 100)) : '';
		const tags = (o.tags || []).slice(0, 3);
		const accentW = Math.round(w * 0.008);
		const pad = Math.round(w * 0.035);

		return `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;background:${p.paper};font-family:${SANS};display:flex;overflow:hidden;position:relative;">` +
			// Accent bar
			`<div style="width:${accentW}px;background:${p.accent};flex-shrink:0;"></div>` +
			// Main content
			`<div style="flex:1;padding:${pad}px;display:flex;flex-direction:column;justify-content:center;">` +
			`<div style="font-size:${Math.round(w * 0.007)}px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${p.accent};margin-bottom:${Math.round(h * 0.02)}px;">${escXml(o.author || today())}</div>` +
			`<div style="font-family:${SERIF};font-size:${fs}px;font-weight:900;line-height:1.1;letter-spacing:-0.03em;color:${p.ink};margin-bottom:${Math.round(h * 0.025)}px;">${escXml(o.title)}</div>` +
			(subtitle ? `<div style="font-size:${Math.round(w * 0.012)}px;line-height:1.55;color:${p.muted};max-width:${Math.round(w * 0.5)}px;">${subtitle}</div>` : '') +
			`</div>` +
			// Right panel
			`<div style="width:${Math.round(w * 0.22)}px;background:${p.tint};padding:${pad}px ${Math.round(pad * 0.8)}px;display:flex;flex-direction:column;justify-content:flex-end;border-left:1px solid ${p.line};">` +
			(tags.length > 0 ?
				tags.map(t =>
					`<div style="padding:${Math.round(h * 0.015)}px 0;border-bottom:1px solid ${p.line};">` +
					`<span style="font-size:${Math.round(w * 0.0075)}px;font-weight:700;color:${p.ink};">${escXml(t)}</span>` +
					`</div>`
				).join('') :
				`<div style="font-size:${Math.round(w * 0.007)}px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${p.muted};">${today()}</div>`
			) +
			`</div>` +
			`</div>`;
	}

	private async htmlToImage(html: string, w: number, h: number): Promise<Blob> {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
			`<foreignObject width="100%" height="100%">${html}</foreignObject>` +
			`</svg>`;

		const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(svgBlob);

		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.canvas.width = w;
				this.canvas.height = h;
				this.ctx.drawImage(img, 0, 0, w, h);
				URL.revokeObjectURL(url);

				this.addNoiseTexture(w, h, 0.025);

				this.canvas.toBlob(
					(blob) => {
						if (blob) resolve(blob);
						else reject(new Error('toBlob failed'));
					},
					'image/png'
				);
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('SVG image load failed'));
			};
			img.src = url;
		});
	}

	private addNoiseTexture(w: number, h: number, opacity: number) {
		const imageData = this.ctx.getImageData(0, 0, w, h);
		const data = imageData.data;
		const strength = opacity * 255;
		for (let i = 0; i < data.length; i += 4) {
			const noise = (Math.random() - 0.5) * strength;
			data[i] = Math.min(255, Math.max(0, data[i] + noise));
			data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
			data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
		}
		this.ctx.putImageData(imageData, 0, 0);
	}
}
