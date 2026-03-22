export type CoverStyle = 'gradient' | 'geometric' | 'minimal' | 'wave' | 'dots' | 'blocks';
export type CoverPalette = 'warm' | 'cool' | 'dark' | 'elegant' | 'vivid' | 'mono' | 'nature' | 'sunset';
export type ArticleTheme = 'default' | 'elegant' | 'modern' | 'simple';

export interface CoverOptions {
	title: string;
	subtitle?: string;
	style: CoverStyle;
	palette: CoverPalette;
	width?: number;
	height?: number;
}

export interface PaletteColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	text: string;
	gradientStops: string[];
}

export interface PluginSettings {
	wechatAppId: string;
	wechatAppSecret: string;
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
	gradient: '渐变流光',
	geometric: '几何图形',
	minimal: '极简风格',
	wave: '流动波浪',
	dots: '圆点图案',
	blocks: '色块拼接',
};

export const COVER_PALETTE_LABELS: Record<CoverPalette, string> = {
	warm: '暖色调',
	cool: '冷色调',
	dark: '暗色调',
	elegant: '典雅',
	vivid: '鲜艳',
	mono: '黑白',
	nature: '自然',
	sunset: '日落',
};

export const ARTICLE_THEME_LABELS: Record<ArticleTheme, string> = {
	default: '经典',
	elegant: '优雅',
	modern: '现代',
	simple: '简约',
};
