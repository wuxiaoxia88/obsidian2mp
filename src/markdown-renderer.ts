import { marked } from 'marked';
import { ArticleTheme } from './types';

interface ThemeStyleSet {
	wrapper: string;
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
	p: string;
	a: string;
	aFootnote: string;
	strong: string;
	em: string;
	del: string;
	blockquote: string;
	blockquoteP: string;
	code: string;
	pre: string;
	preCode: string;
	img: string;
	table: string;
	thead: string;
	th: string;
	td: string;
	trEven: string;
	ul: string;
	ol: string;
	li: string;
	hr: string;
	footnoteSection: string;
	footnoteTitle: string;
	footnoteItem: string;
	figcaption: string;
}

const THEMES: Record<ArticleTheme, ThemeStyleSet> = {
	default: {
		wrapper: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; font-size: 16px; color: #333333; line-height: 1.75; padding: 20px 16px; word-break: break-word;',
		h1: 'font-size: 24px; font-weight: bold; color: #1a1a1a; text-align: center; margin: 32px 0 20px; padding-bottom: 12px; border-bottom: 2px solid #0F4C81;',
		h2: 'font-size: 20px; font-weight: bold; color: #FFFFFF; background-color: #0F4C81; padding: 6px 16px; margin: 28px 0 16px; border-radius: 4px;',
		h3: 'font-size: 18px; font-weight: bold; color: #0F4C81; margin: 24px 0 12px; padding-left: 12px; border-left: 4px solid #0F4C81;',
		h4: 'font-size: 16px; font-weight: bold; color: #333; margin: 20px 0 10px;',
		h5: 'font-size: 15px; font-weight: bold; color: #555; margin: 16px 0 8px;',
		h6: 'font-size: 14px; font-weight: bold; color: #777; margin: 16px 0 8px;',
		p: 'margin: 0 0 16px; line-height: 1.75; text-align: justify;',
		a: 'color: #0F4C81; text-decoration: none; border-bottom: 1px solid #0F4C81; padding-bottom: 1px;',
		aFootnote: 'color: #0F4C81; font-size: 12px; vertical-align: super; text-decoration: none; margin-left: 2px;',
		strong: 'color: #0F4C81; font-weight: bold;',
		em: 'font-style: italic; color: #555;',
		del: 'text-decoration: line-through; color: #999;',
		blockquote: 'margin: 16px 0; padding: 12px 20px; background-color: #f7f7f7; border-left: 4px solid #0F4C81; color: #666; border-radius: 0 4px 4px 0;',
		blockquoteP: 'margin: 0; line-height: 1.75;',
		code: 'font-family: "Fira Code", Menlo, Monaco, Consolas, monospace; background-color: #fff5f5; color: #ff502c; font-size: 14px; padding: 2px 6px; border-radius: 3px;',
		pre: 'margin: 16px 0; padding: 16px; background-color: #282c34; border-radius: 8px; overflow-x: auto;',
		preCode: 'font-family: "Fira Code", Menlo, Monaco, Consolas, monospace; font-size: 14px; color: #abb2bf; background: none; line-height: 1.6; display: block; white-space: pre-wrap; word-break: break-all;',
		img: 'max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 8px;',
		table: 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;',
		thead: 'background-color: #0F4C81; color: #FFFFFF;',
		th: 'padding: 10px 12px; text-align: left; font-weight: bold; border: 1px solid #ddd;',
		td: 'padding: 8px 12px; border: 1px solid #ddd;',
		trEven: 'background-color: #f9f9f9;',
		ul: 'margin: 0 0 16px; padding-left: 28px; list-style-type: disc;',
		ol: 'margin: 0 0 16px; padding-left: 28px;',
		li: 'margin: 4px 0; line-height: 1.75;',
		hr: 'border: none; height: 1px; background: linear-gradient(to right, transparent, #0F4C81, transparent); margin: 24px 0;',
		footnoteSection: 'margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0e0e0;',
		footnoteTitle: 'font-size: 14px; font-weight: bold; color: #999; margin-bottom: 8px;',
		footnoteItem: 'font-size: 13px; color: #999; line-height: 1.8; word-break: break-all;',
		figcaption: 'text-align: center; font-size: 13px; color: #999; margin-top: -12px; margin-bottom: 16px;',
	},
	elegant: {
		wrapper: 'font-family: Georgia, "Songti SC", "SimSun", "Noto Serif SC", serif; font-size: 16px; color: #2c2c2c; line-height: 1.9; padding: 24px 20px; word-break: break-word;',
		h1: 'font-size: 26px; font-weight: bold; color: #8B4513; text-align: center; margin: 36px 0 24px; letter-spacing: 2px;',
		h2: 'font-size: 21px; font-weight: bold; color: #8B4513; margin: 32px 0 18px; padding-bottom: 8px; border-bottom: 1px solid #D2B48C; letter-spacing: 1px;',
		h3: 'font-size: 18px; font-weight: bold; color: #A0522D; margin: 24px 0 14px; letter-spacing: 1px;',
		h4: 'font-size: 16px; font-weight: bold; color: #6B4423; margin: 20px 0 10px;',
		h5: 'font-size: 15px; font-weight: bold; color: #8B7355; margin: 16px 0 8px;',
		h6: 'font-size: 14px; font-weight: bold; color: #A0926B; margin: 16px 0 8px;',
		p: 'margin: 0 0 18px; line-height: 1.9; text-align: justify; text-indent: 2em;',
		a: 'color: #8B4513; text-decoration: none; border-bottom: 1px dashed #D2B48C;',
		aFootnote: 'color: #8B4513; font-size: 12px; vertical-align: super; text-decoration: none;',
		strong: 'color: #8B4513; font-weight: bold;',
		em: 'font-style: italic; color: #6B4423;',
		del: 'text-decoration: line-through; color: #999;',
		blockquote: 'margin: 20px 0; padding: 16px 24px; background-color: #FDF5E6; border-left: 3px solid #D2B48C; color: #6B4423; border-radius: 0 8px 8px 0; font-style: italic;',
		blockquoteP: 'margin: 0; line-height: 1.8; text-indent: 0;',
		code: 'font-family: Menlo, Monaco, Consolas, monospace; background-color: #FDF5E6; color: #8B4513; font-size: 14px; padding: 2px 6px; border-radius: 3px;',
		pre: 'margin: 18px 0; padding: 18px; background-color: #2D2B2B; border-radius: 8px; overflow-x: auto; border: 1px solid #D2B48C;',
		preCode: 'font-family: Menlo, Monaco, Consolas, monospace; font-size: 14px; color: #D4C4A8; background: none; line-height: 1.6; display: block; white-space: pre-wrap; word-break: break-all;',
		img: 'max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(139,69,19,0.1);',
		table: 'width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;',
		thead: 'background-color: #8B4513; color: #FFFFFF;',
		th: 'padding: 10px 14px; text-align: left; font-weight: bold; border: 1px solid #D2B48C;',
		td: 'padding: 8px 14px; border: 1px solid #D2B48C;',
		trEven: 'background-color: #FDF5E6;',
		ul: 'margin: 0 0 18px; padding-left: 28px; list-style-type: disc;',
		ol: 'margin: 0 0 18px; padding-left: 28px;',
		li: 'margin: 6px 0; line-height: 1.8; text-indent: 0;',
		hr: 'border: none; height: 1px; background: linear-gradient(to right, transparent, #D2B48C, transparent); margin: 28px 0;',
		footnoteSection: 'margin-top: 36px; padding-top: 16px; border-top: 1px dashed #D2B48C;',
		footnoteTitle: 'font-size: 14px; font-weight: bold; color: #A0926B; margin-bottom: 8px;',
		footnoteItem: 'font-size: 13px; color: #A0926B; line-height: 1.8; word-break: break-all; text-indent: 0;',
		figcaption: 'text-align: center; font-size: 13px; color: #A0926B; margin-top: -16px; margin-bottom: 18px; font-style: italic;',
	},
	modern: {
		wrapper: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; font-size: 16px; color: #1d1d1f; line-height: 1.8; padding: 20px 16px; word-break: break-word;',
		h1: 'font-size: 28px; font-weight: 800; color: #1d1d1f; text-align: center; margin: 36px 0 24px; letter-spacing: -0.5px;',
		h2: 'font-size: 22px; font-weight: 700; color: #1d1d1f; margin: 32px 0 16px; padding: 8px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #FFFFFF; border-radius: 24px; display: inline-block;',
		h3: 'font-size: 18px; font-weight: 700; color: #667eea; margin: 24px 0 12px;',
		h4: 'font-size: 16px; font-weight: 600; color: #444; margin: 20px 0 10px;',
		h5: 'font-size: 15px; font-weight: 600; color: #666; margin: 16px 0 8px;',
		h6: 'font-size: 14px; font-weight: 600; color: #888; margin: 16px 0 8px;',
		p: 'margin: 0 0 16px; line-height: 1.8;',
		a: 'color: #667eea; text-decoration: none; font-weight: 500;',
		aFootnote: 'color: #667eea; font-size: 12px; vertical-align: super; text-decoration: none; font-weight: bold;',
		strong: 'color: #667eea; font-weight: 700;',
		em: 'font-style: italic;',
		del: 'text-decoration: line-through; color: #aaa;',
		blockquote: 'margin: 16px 0; padding: 16px 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; color: #555; border: none;',
		blockquoteP: 'margin: 0; line-height: 1.75;',
		code: 'font-family: "SF Mono", "Fira Code", Menlo, monospace; background-color: #f0f0f5; color: #667eea; font-size: 14px; padding: 2px 8px; border-radius: 4px; font-weight: 500;',
		pre: 'margin: 16px 0; padding: 20px; background-color: #1e1e2e; border-radius: 12px; overflow-x: auto;',
		preCode: 'font-family: "SF Mono", "Fira Code", Menlo, monospace; font-size: 14px; color: #cdd6f4; background: none; line-height: 1.6; display: block; white-space: pre-wrap; word-break: break-all; font-weight: normal;',
		img: 'max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);',
		table: 'width: 100%; border-collapse: separate; border-spacing: 0; margin: 16px 0; font-size: 14px; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;',
		thead: 'background: linear-gradient(135deg, #667eea, #764ba2); color: #FFFFFF;',
		th: 'padding: 12px 14px; text-align: left; font-weight: 600; border: none;',
		td: 'padding: 10px 14px; border-top: 1px solid #eee;',
		trEven: 'background-color: #f8f8fc;',
		ul: 'margin: 0 0 16px; padding-left: 24px;',
		ol: 'margin: 0 0 16px; padding-left: 24px;',
		li: 'margin: 6px 0; line-height: 1.75;',
		hr: 'border: none; height: 2px; background: linear-gradient(135deg, #667eea, #764ba2); margin: 28px 0; border-radius: 1px;',
		footnoteSection: 'margin-top: 36px; padding-top: 20px; border-top: 2px solid #f0f0f5;',
		footnoteTitle: 'font-size: 14px; font-weight: 600; color: #aaa; margin-bottom: 8px;',
		footnoteItem: 'font-size: 13px; color: #aaa; line-height: 1.8; word-break: break-all;',
		figcaption: 'text-align: center; font-size: 13px; color: #aaa; margin-top: -16px; margin-bottom: 18px;',
	},
	simple: {
		wrapper: 'font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 15px; color: #444; line-height: 1.8; padding: 20px 16px; word-break: break-word;',
		h1: 'font-size: 24px; font-weight: 600; color: #222; text-align: left; margin: 32px 0 20px;',
		h2: 'font-size: 20px; font-weight: 600; color: #222; margin: 28px 0 16px;',
		h3: 'font-size: 17px; font-weight: 600; color: #333; margin: 24px 0 12px;',
		h4: 'font-size: 16px; font-weight: 600; color: #444; margin: 20px 0 10px;',
		h5: 'font-size: 15px; font-weight: 600; color: #555; margin: 16px 0 8px;',
		h6: 'font-size: 14px; font-weight: 600; color: #666; margin: 16px 0 8px;',
		p: 'margin: 0 0 16px; line-height: 1.8;',
		a: 'color: #333; text-decoration: underline;',
		aFootnote: 'color: #666; font-size: 11px; vertical-align: super; text-decoration: none;',
		strong: 'font-weight: 600; color: #222;',
		em: 'font-style: italic;',
		del: 'text-decoration: line-through; color: #bbb;',
		blockquote: 'margin: 16px 0; padding: 12px 16px; background-color: #fafafa; border-left: 3px solid #ddd; color: #666;',
		blockquoteP: 'margin: 0; line-height: 1.75;',
		code: 'font-family: Menlo, Monaco, monospace; background-color: #f5f5f5; color: #333; font-size: 13px; padding: 2px 5px; border-radius: 3px;',
		pre: 'margin: 16px 0; padding: 16px; background-color: #f5f5f5; border-radius: 6px; overflow-x: auto; border: 1px solid #eee;',
		preCode: 'font-family: Menlo, Monaco, monospace; font-size: 13px; color: #333; background: none; line-height: 1.6; display: block; white-space: pre-wrap; word-break: break-all;',
		img: 'max-width: 100%; height: auto; display: block; margin: 16px auto;',
		table: 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;',
		thead: 'background-color: #f5f5f5;',
		th: 'padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid #eee; color: #333;',
		td: 'padding: 8px 12px; border: 1px solid #eee;',
		trEven: 'background-color: #fafafa;',
		ul: 'margin: 0 0 16px; padding-left: 24px;',
		ol: 'margin: 0 0 16px; padding-left: 24px;',
		li: 'margin: 4px 0; line-height: 1.75;',
		hr: 'border: none; height: 1px; background-color: #eee; margin: 24px 0;',
		footnoteSection: 'margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee;',
		footnoteTitle: 'font-size: 13px; color: #999; margin-bottom: 6px;',
		footnoteItem: 'font-size: 12px; color: #999; line-height: 1.7; word-break: break-all;',
		figcaption: 'text-align: center; font-size: 12px; color: #999; margin-top: -12px; margin-bottom: 16px;',
	},
};

interface LinkRef {
	index: number;
	text: string;
	href: string;
}

export class MarkdownRenderer {
	private theme: ArticleTheme;
	private convertLinks: boolean;
	private links: LinkRef[] = [];
	private linkCounter = 0;
	private tableRowCounter = 0;
	private firstHeadingStripped = false;
	private titleToStrip = '';

	constructor(theme: ArticleTheme, convertLinks: boolean) {
		this.theme = theme;
		this.convertLinks = convertLinks;
	}

	render(markdown: string, stripTitle = true): string {
		this.links = [];
		this.linkCounter = 0;
		this.firstHeadingStripped = false;
		this.titleToStrip = '';

		if (stripTitle) {
			this.titleToStrip = this.extractTitle(markdown);
		}

		let content = this.stripFrontmatter(markdown);

		const styles = THEMES[this.theme];

		const renderer = new marked.Renderer();

		renderer.heading = (text: string, level: number): string => {
			if (!this.firstHeadingStripped && this.titleToStrip && (level === 1 || level === 2)) {
				const plainText = text.replace(/<[^>]+>/g, '').trim();
				if (plainText === this.titleToStrip) {
					this.firstHeadingStripped = true;
					return '';
				}
			}
			const key = `h${level}` as keyof ThemeStyleSet;
			const style = styles[key] || styles.h4;
			return `<h${level} style="${style}">${text}</h${level}>\n`;
		};

		renderer.paragraph = (text: string): string => {
			return `<p style="${styles.p}">${text}</p>\n`;
		};

		renderer.strong = (text: string): string => {
			return `<strong style="${styles.strong}">${text}</strong>`;
		};

		renderer.em = (text: string): string => {
			return `<em style="${styles.em}">${text}</em>`;
		};

		renderer.del = (text: string): string => {
			return `<del style="${styles.del}">${text}</del>`;
		};

		renderer.link = (href: string, title: string | null, text: string): string => {
			if (this.convertLinks && href && !href.startsWith('https://mp.weixin.qq.com')) {
				this.linkCounter++;
				this.links.push({
					index: this.linkCounter,
					text: text,
					href: href,
				});
				return `${text}<sup style="${styles.aFootnote}">[${this.linkCounter}]</sup>`;
			}
			const titleAttr = title ? ` title="${title}"` : '';
			return `<a href="${href}" style="${styles.a}"${titleAttr}>${text}</a>`;
		};

		renderer.image = (href: string, title: string | null, text: string): string => {
			let html = `<img src="${href}" alt="${text}" style="${styles.img}" />`;
			if (title || text) {
				html += `\n<figcaption style="${styles.figcaption}">${title || text}</figcaption>`;
			}
			return html + '\n';
		};

		renderer.code = (code: string, language: string | undefined): string => {
			const escapedCode = this.escapeHtml(code);
			const langLabel = language ? `<span style="color: #999; font-size: 12px; float: right; background: transparent;">${language}</span>` : '';
			return `<pre style="${styles.pre}">${langLabel}<section style="${styles.preCode}">${escapedCode}</section></pre>\n`;
		};

		renderer.codespan = (code: string): string => {
			return `<code style="${styles.code}">${code}</code>`;
		};

		renderer.blockquote = (quote: string): string => {
			const processed = quote.replace(
				/<p style="[^"]*">/g,
				`<p style="${styles.blockquoteP}">`
			);
			return `<blockquote style="${styles.blockquote}">${processed}</blockquote>\n`;
		};

		renderer.list = (body: string, ordered: boolean): string => {
			const tag = ordered ? 'ol' : 'ul';
			const style = ordered ? styles.ol : styles.ul;
			return `<${tag} style="${style}">${body}</${tag}>\n`;
		};

		renderer.listitem = (text: string): string => {
			const cleaned = text
				.replace(/<p style="[^"]*">/g, '')
				.replace(/<\/p>\s*/g, '')
				.trim();
			return `<li style="${styles.li}">${cleaned}</li>\n`;
		};

		renderer.table = (header: string, body: string): string => {
			this.tableRowCounter = 0;
			return `<table style="${styles.table}"><thead style="${styles.thead}">${header}</thead><tbody>${body}</tbody></table>\n`;
		};

		renderer.tablerow = (content: string): string => {
			const isEven = this.tableRowCounter % 2 === 0;
			this.tableRowCounter++;
			const bgStyle = isEven && styles.trEven ? ` style="${styles.trEven}"` : '';
			return `<tr${bgStyle}>${content}</tr>\n`;
		};

		renderer.tablecell = (content: string, flags: { header: boolean; align: string | null }): string => {
			const tag = flags.header ? 'th' : 'td';
			const style = flags.header ? styles.th : styles.td;
			const alignStyle = flags.align ? ` text-align: ${flags.align};` : '';
			return `<${tag} style="${style}${alignStyle}">${content}</${tag}>`;
		};

		renderer.hr = (): string => {
			return `<hr style="${styles.hr}" />\n`;
		};

		renderer.br = (): string => {
			return '<br />';
		};

		marked.setOptions({
			renderer: renderer,
			gfm: true,
			breaks: false,
		});

		let html = marked.parse(content) as string;

		if (this.convertLinks && this.links.length > 0) {
			html += this.renderFootnotes(styles);
		}

		return `<section style="${styles.wrapper}">${html}</section>`;
	}

	private renderFootnotes(styles: ThemeStyleSet): string {
		let html = `<section style="${styles.footnoteSection}">`;
		html += `<p style="${styles.footnoteTitle}">引用链接</p>`;

		for (const link of this.links) {
			html += `<p style="${styles.footnoteItem}">[${link.index}] ${link.text}: <a href="${link.href}" style="color: #999; word-break: break-all;">${link.href}</a></p>`;
		}

		html += '</section>';
		return html;
	}

	extractTitle(markdown: string): string {
		const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
			if (titleMatch) return titleMatch[1].trim().replace(/^["']|["']$/g, '');
		}

		const headingMatch = markdown.match(/^#{1,2}\s+(.+)$/m);
		if (headingMatch) return headingMatch[1].trim();

		return '';
	}

	extractDescription(markdown: string): string {
		const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const descMatch = frontmatterMatch[1].match(/^description:\s*(.+)$/m);
			if (descMatch) return descMatch[1].trim().replace(/^["']|["']$/g, '');
		}

		const content = this.stripFrontmatter(markdown);
		const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
		if (lines.length > 0) {
			const text = lines.slice(0, 3).join(' ').replace(/[#*_`\[\]()]/g, '');
			return text.length > 120 ? text.slice(0, 117) + '...' : text;
		}

		return '';
	}

	extractAuthor(markdown: string): string {
		const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const authorMatch = frontmatterMatch[1].match(/^author:\s*(.+)$/m);
			if (authorMatch) return authorMatch[1].trim().replace(/^["']|["']$/g, '');
		}
		return '';
	}

	stripFrontmatter(markdown: string): string {
		return markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
	}

	private escapeHtml(str: string): string {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}
}
