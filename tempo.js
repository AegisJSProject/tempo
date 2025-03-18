/**
 * Debounces a function using scheduler.postTask().
 *
 * @param {Function} callback The function to debounce.
 * @param {object} [options] Debounce options.
 * @param {number} [options.delay] The debounce delay in milliseconds.
 * @param {"user-blocking"|"user-visible"|"background"} [options.priority] The task priority ('user-blocking', 'user-visible', 'background').
 * @param {AbortSignal} [options.signal] An AbortSignal to cancel the debounced call.
 * @param {any} [options.thisArg=null] The 'this' context for the callback.
 * @returns {Function} A debounced version of the input function.
 * @throws {TypeError} If the callback is not a function.
 * @throws {Error} If the provided AbortSignal is already aborted.
 */
export function debounce(callback, {
	delay,
	priority,
	signal,
	thisArg = null,
} = {}) {
	if (typeof callback !== 'function') {
		throw new TypeError('Callback must be a function.');
	} else if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else if (signal instanceof AbortSignal) {
		let controller;

		return async (...args) => {
			if (! signal.aborted) {
				if (controller instanceof AbortController && ! controller.signal.aborted) {
					controller.abort();
				}

				controller = new AbortController();

				return await scheduler.postTask(() => callback.apply(thisArg, args), {
					delay,
					priority,
					signal: AbortSignal.any([signal, controller.signal]),
				}).catch(() => null);
			}
		};
	} else {
		let controller;

		return async (...args) => {
			if (controller instanceof AbortController && ! controller.signal.aborted) {
				controller.abort();
			}

			controller = new AbortController();

			return await scheduler.postTask(() => callback.apply(thisArg, args), {
				delay,
				priority,
				signal: controller.signal,
			}).catch(() => null);
		};
	}
}

/**
 * Throttle a function using scheduler.postTask().
 *
 * @param {Function} callback The function to throttle.
 * @param {object} [options] Throttle options.
 * @param {string} [options.lockName=crypto.randomUUID()] The name for the lock, defaulting to a random UUID.
 * @param {number} [options.delay] The delay in milliseconds.
 * @param {"user-blocking"|"user-visible"|"background"} [options.priority] The task priority ('user-blocking', 'user-visible', 'background').
 * @param {boolean} [options.ifAvailable=true] If true, the lock request fails immediately if the lock is not available. If false, the request waits.
 * @param {boolean} [options.steal=false] If true, the lock request can "steal" the lock from waiting requests. If false, the request waits in the queue.
 * @param {"shared"|"exclusive"} [options.mode="exclusive"] The lock mode ('exclusive'). Only 'exclusive' is supported for throttling.
 * @param {any} [options.thisArg=null] The 'this' context for the callback.
 * @param {AbortSignal} [options.signal] An AbortSignal to cancel the throttled call.
 * @returns {Function} A throttled version of the input function.
 * @throws {TypeError} If the callback is not a function or if both `steal` and `ifAvailable` are both true.
 * @throws {Error} If the provided AbortSignal is already aborted.
 */
export function throttle(callback, {
	lockName = crypto.randomUUID(),
	delay,
	priority,
	ifAvailable = true,
	steal = false,
	mode = 'exclusive',
	signal,
	thisArg = null,
} = {}) {
	if (typeof callback !== 'function') {
		throw new TypeError('Callback must be a function.');
	} else if (steal && ifAvailable) {
		throw new TypeError('Cannot set both `steal` and `ifAvailable`.');
	} else if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else {
		return async (...args) => {
			const hasSignal = signal instanceof AbortSignal;
			await navigator.locks.request(
				lockName,
				{ mode, ifAvailable, steal },
				async (lock) => {
					// Cannot use both `signal` and `ifAvailable` together
					if (lock instanceof Lock && ! (hasSignal && signal.aborted)) {
						const result = await scheduler.postTask(() => callback.apply(thisArg, args), { priority, signal });
						await new Promise(resolve => setTimeout(resolve, delay));
						return result;
					} else {
						return null;
					}
				}
			);
		};
	}
}
