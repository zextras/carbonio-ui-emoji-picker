/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createRef } from 'react';

import itI18n from '@emoji-mart/data/i18n/it.json' with { type: 'json' };
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Picker } from 'emoji-mart';

import { EmojiPicker } from '../index.js';
import { loadEmojiMart } from '../load-emoji-mart.js';

type PickerElement = HTMLElement & { props: Record<string, unknown> };

const HOST_TEST_ID = 'emoji-picker-host';
const REGISTERED_PICKER_TEST_ID = 'registered-emoji-picker';
const EMOJI_MART = 'emoji-mart';

const getPickers = (): NodeListOf<PickerElement> =>
	// em-emoji-picker has no role or text to query it by
	// eslint-disable-next-line testing-library/no-node-access
	screen.getByTestId(HOST_TEST_ID).querySelectorAll<PickerElement>('em-emoji-picker');

const findPicker = async (): Promise<PickerElement> => {
	await waitFor(() => expect(getPickers()).toHaveLength(1));
	return getPickers()[0];
};

/** A class registered as em-emoji-picker by another module, standing in for its own emoji-mart copy */
const mockRegisteredPicker = (): ReturnType<typeof vi.fn> => {
	const registeredPicker = vi.fn(function RegisteredPicker(props: {
		ref: { current: HTMLElement };
	}) {
		const element = document.createElement('registered-emoji-picker');
		element.dataset.testid = REGISTERED_PICKER_TEST_ID;
		props.ref.current.appendChild(element);
		return element;
	});
	vi.spyOn(customElements, 'get').mockImplementation((name) =>
		name === 'em-emoji-picker'
			? (registeredPicker as unknown as CustomElementConstructor)
			: undefined
	);
	return registeredPicker;
};

describe('EmojiPicker', () => {
	beforeAll(async () => {
		// emoji-mart registers its custom elements when loaded, before any test mocks the registry
		await loadEmojiMart();
	});

	it('renders the host element with the given attributes and forwards the ref to it', () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<EmojiPicker
				ref={ref}
				onEmojiSelect={vi.fn()}
				data-testid={HOST_TEST_ID}
				className="custom-class"
				id="custom-id"
				style={{ width: '22rem' }}
			/>
		);

		const host = screen.getByTestId(HOST_TEST_ID);
		expect(host).toHaveClass('custom-class');
		expect(host).toHaveAttribute('id', 'custom-id');
		expect(host).toHaveStyle({ width: '22rem' });
		expect(ref.current).toBe(host);
	});

	it('appends the emoji-mart picker to the host once emoji-mart is loaded', async () => {
		render(<EmojiPicker onEmojiSelect={vi.fn()} data-testid={HOST_TEST_ID} />);

		expect(await findPicker()).toBeInstanceOf(Picker);
	});

	it('passes the options to the picker', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(itI18n));
		render(
			<EmojiPicker
				onEmojiSelect={vi.fn()}
				data-testid={HOST_TEST_ID}
				theme="dark"
				locale="it"
				perLine={7}
				previewPosition="none"
			/>
		);

		const picker = await findPicker();
		expect(picker.props).toEqual(
			expect.objectContaining({ theme: 'dark', locale: 'it', perLine: 7, previewPosition: 'none' })
		);
		// emoji-mart downloads the translations of the locale
		await waitFor(() =>
			expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/i18n/it.json'))
		);
	});

	it('calls onEmojiSelect with the emoji clicked in the picker', async () => {
		const onEmojiSelect = vi.fn();
		render(
			<EmojiPicker
				onEmojiSelect={onEmojiSelect}
				data-testid={HOST_TEST_ID}
				previewPosition="none"
			/>
		);

		const picker = await findPicker();
		const pickerContent = within(picker.shadowRoot as unknown as HTMLElement);
		// the emoji is both in the frequently used and in its own category
		const [emojiButton] = await pickerContent.findAllByRole('button', { name: '😀' });
		await userEvent.click(emojiButton);

		expect(onEmojiSelect).toHaveBeenCalledTimes(1);
		expect(onEmojiSelect).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'grinning', native: '😀', unified: '1f600' })
		);
	});

	it('calls the latest onEmojiSelect without rebuilding the picker', async () => {
		const firstOnEmojiSelect = vi.fn();
		const latestOnEmojiSelect = vi.fn();
		const { rerender } = render(
			<EmojiPicker onEmojiSelect={firstOnEmojiSelect} data-testid={HOST_TEST_ID} />
		);
		const picker = await findPicker();

		rerender(<EmojiPicker onEmojiSelect={latestOnEmojiSelect} data-testid={HOST_TEST_ID} />);
		const onPickerEmojiSelect = picker.props.onEmojiSelect as (emoji: unknown) => void;
		act(() => onPickerEmojiSelect({ id: 'grinning' }));

		expect(getPickers()[0]).toBe(picker);
		expect(firstOnEmojiSelect).not.toHaveBeenCalled();
		expect(latestOnEmojiSelect).toHaveBeenCalledWith({ id: 'grinning' });
	});

	it('uses the em-emoji-picker class already registered by another module instead of its own', async () => {
		const registeredPicker = mockRegisteredPicker();
		render(
			<EmojiPicker onEmojiSelect={vi.fn()} data-testid={HOST_TEST_ID} previewPosition="none" />
		);

		await waitFor(() => expect(registeredPicker).toHaveBeenCalledTimes(1));
		expect(registeredPicker).toHaveBeenCalledWith(
			expect.objectContaining({ previewPosition: 'none', data: expect.any(Object) })
		);
		expect(screen.getByTestId(REGISTERED_PICKER_TEST_ID)).toBeVisible();
	});

	it('rebuilds the picker when an option changes, leaving only the new one in the host', async () => {
		const { rerender } = render(
			<EmojiPicker onEmojiSelect={vi.fn()} data-testid={HOST_TEST_ID} theme="light" />
		);
		const lightPicker = await findPicker();

		rerender(<EmojiPicker onEmojiSelect={vi.fn()} data-testid={HOST_TEST_ID} theme="dark" />);

		// removed right away, not when the new picker replaces it
		expect(lightPicker).not.toBeInTheDocument();
		const darkPicker = await findPicker();
		expect(darkPicker.props).toEqual(expect.objectContaining({ theme: 'dark' }));
	});

	it('keeps the picker when the options are recreated with the same values', async () => {
		const { rerender } = render(
			<EmojiPicker
				onEmojiSelect={vi.fn()}
				data-testid={HOST_TEST_ID}
				categories={['people', 'nature']}
			/>
		);
		const picker = await findPicker();

		rerender(
			<EmojiPicker
				onEmojiSelect={vi.fn()}
				data-testid={HOST_TEST_ID}
				categories={['people', 'nature']}
			/>
		);
		await act(() => loadEmojiMart());

		expect(getPickers()).toHaveLength(1);
		expect(getPickers()[0]).toBe(picker);
	});

	it('does not create the picker when unmounted before emoji-mart is loaded', async () => {
		const registeredPicker = mockRegisteredPicker();
		const { unmount } = render(<EmojiPicker onEmojiSelect={vi.fn()} />);

		unmount();
		await loadEmojiMart();

		expect(registeredPicker).not.toHaveBeenCalled();
	});
});

describe('EmojiPicker, when emoji-mart cannot be loaded', () => {
	afterEach(() => {
		vi.doUnmock(EMOJI_MART);
		vi.resetModules();
	});

	it('logs the error and loads emoji-mart again for the next picker', async () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.resetModules();
		vi.doMock(EMOJI_MART, () => {
			throw new Error('chunk failed to load');
		});
		const { EmojiPicker: FreshEmojiPicker } = await import('../index.js');

		const { unmount } = render(
			<FreshEmojiPicker onEmojiSelect={vi.fn()} data-testid={HOST_TEST_ID} />
		);
		await waitFor(() =>
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Unable to load the emoji picker',
				expect.any(Error)
			)
		);
		expect(getPickers()).toHaveLength(0);
		unmount();

		vi.doUnmock(EMOJI_MART);
		render(<FreshEmojiPicker onEmojiSelect={vi.fn()} data-testid={HOST_TEST_ID} />);

		expect(await findPicker()).toBeInstanceOf(HTMLElement);
	});
});
