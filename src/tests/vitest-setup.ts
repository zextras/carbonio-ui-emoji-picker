/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

failOnConsole();

// browser APIs used by emoji-mart and missing in jsdom
beforeAll(() => {
	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: vi.fn(function IntersectionObserver() {
			return {
				observe: vi.fn(),
				unobserve: vi.fn(),
				disconnect: vi.fn()
			};
		})
	});

	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn((media: string) => ({
			media,
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))
	});
});
