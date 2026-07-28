# Changelog

## 2.0.0
    **BREAKING**: entry points and dependency model changed
    docs: document that dialog content is HTML (with XSS caveat)
    build: emit standalone dialogify.css plus IIFE / ESM / CJS bundles and .d.ts types
    build: ship dialog-polyfill as an optional separate bundle (not bundled by default)
    refactor: drop IIFE wrapper, export default + window global, methods on prototype
    refactor: read global config lazily, replace $.get with fetch
    refactor: replace ResizeSensor with ResizeObserver, remove edge/iPad hack
    chore: jquery moved to peerDependencies, devDependencies updated (0 audit issues)
    chore: add ESLint, Prettier, vitest DOM tests and GitHub Actions CI

## 1.0.6
    revert dialog-polyfill.js

## 1.0.5
    build with esbuild
    add promise api for static methods
    remove dialog-polyfill.js
    remove ResizeSensor.js

## 1.0.4
    add dialogOptions in static dialog method
    change some style

## 1.0.3
    change package name
    change gulp-uglify to gulp-terser
    refactoring to ES6 (let, template, class)

## 1.0.2
    add dialog style options
    add close button style options
    fix blurry render in some browser

## 1.0.1
    add global config
    add closeAll static method

## 1.0.0
    release
