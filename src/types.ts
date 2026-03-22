export type CoverStyle = 'editorial' | 'magazine' | 'minimal' | 'panel';
export type CoverPalette = 'classic' | 'warm' | 'cool' | 'dark' | 'nature' | 'vivid';
export type ArticleTheme = 'default' | 'elegant' | 'modern' | 'simple';

export interface CoverOptions {
	title: string;
	subtitle?: string;
	author?: string;
	tags?: string[];
	style: CoverStyle;
	palette: CoverPalette;
	width?: number;
	height?: number;
}

export interface CardPaletteColors {
	paper: string;
	paperDeep: string;
	ink: string;
	muted: string;
	accent: string;
	tint: string;
	line: string;
}

export interface PaletteColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	text: string;
	gradientStops: string[];
}

export interface WeChatAccount {
	name: string;
	appId: string;
	appSecret: string;
}

export interface PluginSettings {
	wechatAccounts: WeChatAccount[];
	activeAccountIndex: number;
	defaultAuthor: string;
	defaultTheme: ArticleTheme;
	defaultCoverStyle: CoverStyle;
	defaultCoverPalette: CoverPalette;
	convertLinksToFootnotes: boolean;
	coverSaveLocation: 'same' | 'subfolder';
	coverSubfolder: string;
}

export interface WeChatDraftArticle {
	title: string;
	author?: string;
	digest?: string;
	content: string;
	thumb_media_id: string;
	content_source_url?: string;
	need_open_comment?: number;
	only_fans_can_comment?: number;
}

export interface WeChatUploadResult {
	url?: string;
	media_id?: string;
	errcode?: number;
	errmsg?: string;
}

export interface WeChatTokenResult {
	access_token?: string;
	expires_in?: number;
	errcode?: number;
	errmsg?: string;
}

export interface WeChatDraftResult {
	media_id?: string;
	errcode?: number;
	errmsg?: string;
}

export const COVER_STYLE_LABELS: Record<CoverStyle, string> = {
	editorial: '社论风格',
	magazine: '杂志排版',
	minimal: '大字极简',
	panel: '面板布局',
};

export const COVER_PALETTE_LABELS: Record<CoverPalette, string> = {
	classic: '经典纸色',
	warm: '暖色调',
	cool: '冷色调',
	dark: '暗色风格',
	nature: '自然绿',
	vivid: '活力红',
};

export const ARTICLE_THEME_LABELS: Record<ArticleTheme, string> = {
	default: '经典',
	elegant: '优雅',
	modern: '现代',
	simple: '简约',
};

export const GITHUB_REPO = 'wuxiaoxia88/obsidian2mp';
