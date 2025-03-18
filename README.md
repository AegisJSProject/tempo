# @aegisjsproject/tempo

Tempo provides advanced debouncing and throttling utilities for fine-grained execution control.

[![CodeQL](https://github.com/AegisJSProject/tempo/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AegisJSProject/tempo/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/AegisJSProject/tempo/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/AegisJSProject/tempo/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/AegisJSProject/tempo.svg)](https://github.com/AegisJSProject/tempo/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/AegisJSProject/tempo.svg)](https://github.com/AegisJSProject/tempo/commits/master)
[![GitHub release](https://img.shields.io/github/release/AegisJSProject/tempo?logo=github)](https://github.com/AegisJSProject/tempo/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@aegisjsproject/tempo)](https://www.npmjs.com/package/@aegisjsproject/tempo)
![node-current](https://img.shields.io/node/v/@aegisjsproject/tempo)
![npm bundle size gzipped](https://img.shields.io/bundlephobia/minzip/@aegisjsproject/tempo)
[![npm](https://img.shields.io/npm/dw/@aegisjsproject/tempo?logo=npm)](https://www.npmjs.com/package/@aegisjsproject/tempo)

[![GitHub followers](https://img.shields.io/github/followers/AegisJSProject.svg?style=social)](https://github.com/AegisJSProject)
![GitHub forks](https://img.shields.io/github/forks/AegisJSProject/tempo.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/AegisJSProject/tempo.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->

# @aegisjsproject/tempo

A lightweight JavaScript library for debouncing and throttling functions using modern, native web APIs.

---

## Overview

`@aegisjsproject/tempo` provides robust debouncing and throttling utilities by leveraging the browser's latest scheduling and locking APIs. Using methods like `scheduler.postTask` and `navigator.locks.request`, the library offers precise task scheduling with native priority support, efficient cancellation via AbortSignals, and streamlined resource management.

---

## Features

- **Debounce Function**  
  Debounces a callback function by scheduling it with `scheduler.postTask`. It supports custom delays, task priorities (`user-blocking`, `user-visible`, `background`), and cancellation through AbortSignals.

- **Throttle Function**  
  Throttles a callback by combining `scheduler.postTask` with `navigator.locks.request` for controlled, queued execution. It provides options for lock naming, immediate failure or lock stealing, and built-in delay management.

---

## Advantages of Modern Methods

- **Native Integration:**  
  Leverages browser-native APIs for task scheduling and lock management, reducing dependency overhead and resulting in smaller bundle sizes.

- **Improved Performance:**  
  Native scheduling with `scheduler.postTask` allows tasks to be queued based on system and user priorities, leading to smoother and more responsive applications.

- **Enhanced Control:**  
  With built-in support for AbortSignals and fine-grained control over task priorities, developers can efficiently manage resource-intensive operations.

- **Optimized Concurrency:**  
  The use of `navigator.locks.request` ensures that throttled tasks handle concurrent execution gracefully without resorting to heavy third-party libraries.

---

## Installation

Install the package via npm:

```bash
npm install @aegisjsproject/tempo
```

---

## Usage

Import the desired functions into your project:

```js
import { debounce, throttle } from '@aegisjsproject/tempo';
```

### Usage with a CDN and `<script type="importmap">`

```html
<script type="importmap">
  {
    "imports": {
      "@aegisjsproject/tempo": "https://unpkg.com/@aegisjsproject[:version]/tempo.js"
    }
  }
</script>
```
### Debounce Example

```js
const debouncedAction = debounce(() => {
  // Your callback code here.
}, {
  delay: 300,
  priority: 'user-visible',
  signal: myAbortSignal, // Optional: provide an AbortSignal for cancellation.
});
```

### Throttle Example

```js
const throttledAction = throttle(() => {
  // Your callback code here.
}, {
  lockName: 'uniqueLockName', // Optional: defaults to a random UUID.
  delay: 200,
  priority: 'background',
  ifAvailable: true, // Immediately fail if the lock is unavailable.
  signal: myAbortSignal, // Optional: provide an AbortSignal for cancellation.
});
```

---

## API Documentation

### `debounce(callback, options)`

- **Parameters:**
  - `callback` *(Function)*: The function to debounce.
  - `options` *(Object, optional)*:
    - `delay` *(number)*: The debounce delay in milliseconds.
    - `priority` *("user-blocking" | "user-visible" | "background")*: The task priority.
    - `signal` *(AbortSignal)*: Signal to cancel the debounced call.
    - `thisArg` *(any, default: null)*: The `this` context for the callback.
  
- **Returns:**  
  A debounced version of the input function.

- **Throws:**  
  - `TypeError` if the callback is not a function.
  - `Error` if the provided AbortSignal is already aborted.

### `throttle(callback, options)`

- **Parameters:**
  - `callback` *(Function)*: The function to throttle.
  - `options` *(Object, optional)*:
    - `lockName` *(string, default: crypto.randomUUID())*: Name for the lock.
    - `delay` *(number)*: Delay in milliseconds after task execution.
    - `priority` *("user-blocking" | "user-visible" | "background")*: The task priority.
    - `ifAvailable` *(boolean, default: true)*: Fail immediately if the lock is not available.
    - `steal` *(boolean, default: false)*: Allow stealing of the lock.
    - `mode` *("shared" | "exclusive", default: "exclusive")*: The lock mode (only 'exclusive' is supported).
    - `thisArg` *(any, default: null)*: The `this` context for the callback.
    - `signal` *(AbortSignal)*: Signal to cancel the throttled call.
  
- **Returns:**  
  A throttled version of the input function.

- **Throws:**  
  - `TypeError` if the callback is not a function or if both `steal` and `ifAvailable` are set to true.
  - `Error` if the provided AbortSignal is already aborted.
