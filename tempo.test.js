// import '@shgysk8zer0/polyfills';
import './locks.js';
import { debounce, throttle } from './tempo.js';
import { test, describe } from 'node:test';
import { ok, strictEqual } from 'node:assert';

const signal = AbortSignal.timeout(1000);

describe('Test tempo functions.', () => {
	test('Test `debounce()` callbacks run.', { signal }, async () => {
		let called = false;
		const callback = debounce(() => called = true, { signal });
		await callback();

		ok(called, 'Debounced functions should be called.');
	});

	test('Test aborting `debounce()` callbacks.', { signal }, async () => {
		let called = false;
		const callback = debounce(() => called = true, { signal: AbortSignal.any([signal, AbortSignal.timeout(1)]), delay: 50 });
		await callback();

		ok(! called, 'Aborted debounced functions should be cancelled.');
	});

	test('Test `debounce()` callbacks are only called once.', { signal }, async () => {
		let called = 0;
		const callback = debounce(() => called++, { signal, delay: 10 });
		await Promise.allSettled([callback(), callback(), callback()]);

		strictEqual(called, 1, 'Debounced callbacks should only be called once.');
	});

	test('Test locks for `throttle()`.', { signal }, async () => {
		let called = false;
		const callback = throttle(() => called = true);
		await callback();
		ok(called, 'Throttled functions should be called.');
	});

	test('Test aborting `throttled()` callbacks.', { signal }, async () => {
		let called = false;
		const callback = throttle(() => called = true, { signal: AbortSignal.any([signal, AbortSignal.timeout(1)]), delay: 50 });
		await callback();

		ok(! called, 'Aborted throttled functions should be cancelled.');
	});

	test('Test `throttle()` callbacks are only called once.', { signal }, async () => {
		let called = 0;
		const callback = throttle(() => called++, { signal, delay: 10 });
		await Promise.allSettled([callback(), callback(), callback()]);

		strictEqual(called, 1, 'Throttled callbacks should only be called once.');
	});
});
