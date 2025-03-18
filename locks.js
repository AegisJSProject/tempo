import '@shgysk8zer0/polyfills';

const locks = Object.freeze({
	shared: new Map(),
	exclusive: new Map(),
});

globalThis.Lock = class Lock {
	#mode;
	#name;

	constructor(name, mode) {
		this.#name = name;
		this.#mode = mode;
	}

	get name() {
		return this.#name;
	}

	get mode() {
		return this.#mode;
	}
};

globalThis.navigator = {
	locks: {
		query() {
			return Object.freeze({
				shared: Array.from(locks.shared.values()),
				exclusive: Array.from(locks.exclusive.values()),
			});
		},
		async request(name, {
			delay = 0,
			mode = 'exclusive',
			signal,
		}, callback) {
			if (! (mode in locks)) {
				throw new TypeError(`Invalid lock mode "${mode}".`);
			} else if (signal instanceof AbortSignal && signal.aborted) {
				throw signal.reason;
			} else if (! locks[mode].has(name)) {
				const lock = new Lock(name, mode);
				const controller = new AbortController();
				const { resolve, reject, promise } = Promise.withResolvers();
				controller.signal.addEventListener('abort', ({ target }) => reject(target.reason), { once: true });
				locks[mode].set(name, lock);

				try {
					let timeout = NaN;

					const wait = typeof delay === 'number' ? new Promise(resolve => {
						timeout = setTimeout(resolve, delay);
					}) : Promise.resolve();

					if (signal instanceof AbortSignal) {
						signal.addEventListener('abort', ({ target }) => {
							controller.abort(target.reason);

							if (! Number.isNaN(timeout)) {
								clearTimeout(timeout);
							}
						});
					}

					await Promise.race([wait, promise]).then(() => {
						locks[mode].get(name) === lock
							? Promise.try(() => callback(lock)).then(resolve, reject)
							: Promise.try(callback).then(resolve, reject);
					}).catch(err => reject(err));

				} catch(err) {
					reject(err);
				} finally {
					/* eslint no-unsafe-finally: off */
					const [result, err] = await promise.then(result => [result, null]).catch(err => [null, err]);

					if (locks[mode].get(name) === lock) {
						locks[mode].delete(name);
					}

					if (! controller.signal.aborted) {
						controller.abort(err);
					}

					if (err instanceof Error) {
						throw err;
					} else {
						return result;
					}
				}
			}
		}
	}
};
