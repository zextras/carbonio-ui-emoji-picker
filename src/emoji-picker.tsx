/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { loadEmojiMart } from './load-emoji-mart.js';
import type { Emoji, EmojiPickerOptions, EmojiPickerProps } from './types.js';

const isSameOption = (a: unknown, b: unknown): boolean =>
	a === b ||
	(typeof a === 'object' && typeof b === 'object' && JSON.stringify(a) === JSON.stringify(b));

const areSameOptions = (a: EmojiPickerOptions, b: EmojiPickerOptions): boolean => {
	const keys = Object.keys(a) as Array<keyof EmojiPickerOptions>;
	return keys.length === Object.keys(b).length && keys.every((key) => isSameOption(a[key], b[key]));
};

/** Returns the same object until the options change, even if the caller creates them on every render */
const useStableOptions = (options: EmojiPickerOptions): EmojiPickerOptions => {
	const stableOptionsRef = useRef(options);
	if (!areSameOptions(stableOptionsRef.current, options)) {
		stableOptionsRef.current = options;
	}
	return stableOptionsRef.current;
};

/**
 * The emoji-mart picker, rendered inside a div.
 * emoji-mart is loaded the first time a picker is mounted, so the picker appears asynchronously.
 */
export const EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>(function EmojiPicker(
	{ onEmojiSelect, className, style, id, 'data-testid': dataTestId, ...options },
	ref
) {
	const hostRef = useRef<HTMLDivElement>(null);
	useImperativeHandle(ref, () => hostRef.current as HTMLDivElement);

	// the picker calls the latest callback, so a new callback does not rebuild it
	const onEmojiSelectRef = useRef(onEmojiSelect);
	useEffect(() => {
		onEmojiSelectRef.current = onEmojiSelect;
	}, [onEmojiSelect]);

	const stableOptions = useStableOptions(options);

	useEffect(() => {
		let unmounted = false;
		let picker: HTMLElement | undefined;
		loadEmojiMart()
			.then(({ Picker, data }): void => {
				if (unmounted) {
					return;
				}
				// em-emoji-picker can be registered only once per page: if a module bundling its own emoji-mart
				// registered it first, constructing our Picker class throws "Illegal constructor"
				const PickerClass = customElements.get('em-emoji-picker') ?? Picker;
				picker = new PickerClass({
					...stableOptions,
					data,
					onEmojiSelect: (emoji: Emoji) => onEmojiSelectRef.current(emoji),
					ref: hostRef
				});
			})
			.catch((error: unknown) => {
				console.error('Unable to load the emoji picker', error);
			});
		return (): void => {
			unmounted = true;
			picker?.remove();
		};
	}, [stableOptions]);

	return <div ref={hostRef} className={className} style={style} id={id} data-testid={dataTestId} />;
});
