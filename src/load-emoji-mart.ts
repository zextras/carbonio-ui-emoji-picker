/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EmojiMartData } from '@emoji-mart/data';

// emoji-mart's typings declare a base class TypeScript cannot resolve, hiding the HTMLElement members
type PickerConstructor = new (props: Record<string, unknown>) => HTMLElement;

type EmojiMart = {
	Picker: PickerConstructor;
	data: EmojiMartData;
};

let emojiMartPromise: Promise<EmojiMart> | undefined;

/**
 * Loads emoji-mart and its data the first time a picker is opened, so they stay out of the bundle
 * of whoever imports this package (the shell, which shares it with the modules).
 */
export const loadEmojiMart = (): Promise<EmojiMart> => {
	emojiMartPromise ??= Promise.all([
		import(/* webpackChunkName: "emoji-mart" */ 'emoji-mart'),
		import(/* webpackChunkName: "emoji-mart-data" */ '@emoji-mart/data')
	]).then(
		([{ Picker }, { default: data }]) => ({
			Picker: Picker as unknown as PickerConstructor,
			data: data as EmojiMartData
		}),
		(error: unknown) => {
			// let the next picker retry, e.g. after a chunk failed to download
			emojiMartPromise = undefined;
			throw error;
		}
	);
	return emojiMartPromise;
};
