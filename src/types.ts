/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CSSProperties } from 'react';

/** The emoji passed to `onEmojiSelect`. */
export type Emoji = {
	id: string;
	name: string;
	native: string;
	unified: string;
	keywords: string[];
	shortcodes: string;
	/** Only for emojis with skin tones: the selected tone, from 1 to 6 */
	skin?: number;
	aliases?: string[];
	emoticons?: string[];
};

/**
 * The emoji-mart Picker options, except custom emojis and image sets.
 * Values that emoji-mart does not support fall back to its defaults.
 * Function options are compared by identity, so memoize them to avoid rebuilding the picker on every render.
 *
 * @see https://github.com/missive/emoji-mart#options--props
 */
export type EmojiPickerOptions = {
	/** Locales other than `en` are downloaded by emoji-mart from its CDN, unless `i18n` is given */
	locale?: string;
	/** Translations, e.g. the content of `@emoji-mart/data/i18n/<locale>.json` */
	i18n?: Record<string, unknown>;
	theme?: 'auto' | 'light' | 'dark';
	set?: 'native' | 'apple' | 'facebook' | 'google' | 'twitter';
	icons?: 'auto' | 'outline' | 'solid';
	previewPosition?: 'top' | 'bottom' | 'none';
	previewEmoji?: string;
	searchPosition?: 'sticky' | 'static' | 'none';
	navPosition?: 'top' | 'bottom' | 'none';
	skinTonePosition?: 'preview' | 'search' | 'none';
	skin?: 1 | 2 | 3 | 4 | 5 | 6;
	perLine?: number;
	dynamicWidth?: boolean;
	maxFrequentRows?: number;
	emojiSize?: number;
	emojiButtonSize?: number;
	emojiButtonRadius?: string;
	emojiButtonColors?: string[];
	emojiVersion?: number;
	/** Category ids, in the order they are shown */
	categories?: string[];
	exceptEmojis?: string[];
	noCountryFlags?: boolean;
	noResultsEmoji?: string;
	autoFocus?: boolean;
	onClickOutside?: (event: MouseEvent) => void;
};

/** Attributes applied to the element hosting the picker */
type EmojiPickerHostProps = {
	className?: string;
	style?: CSSProperties;
	id?: string;
	'data-testid'?: string;
};

export type EmojiPickerProps = EmojiPickerOptions &
	EmojiPickerHostProps & {
		onEmojiSelect: (emoji: Emoji) => void;
	};
