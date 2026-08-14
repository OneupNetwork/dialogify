# Changelog

## Unreleased
    docs: rewrote the documentation site — every option, method, event and theme property is now listed with a runnable example, replacing the unmaintained Material Design Lite layout
    docs: light/dark theme switch on the site, wired to the same data-theme attribute the dialog itself reads
    docs: Traditional Chinese and English, switchable at runtime and remembered; Chinese ships in the markup so the page reads without JavaScript

## 2.3.0
    feat: a dark palette behind data-theme="dark", with data-theme="auto" following prefers-color-scheme; opt-in, so an existing site is unchanged on upgrade
    feat: every colour in the stylesheet is now a --dialogify-* custom property, so a page can retheme the dialog without overriding rules
    feat: --dialogify-icon-filter re-tints the built-in single-colour icons, whose fill is baked into the inline SVGs

## 2.2.2
    fix: toasts and non-modal dialogs no longer hide behind site chrome such as a sticky nav; the z-index defaults are now 1010 and 1000
    feat: --dialogify-z-index and --dialogify-toast-z-index custom properties to fit another layering scheme
    chore: postcss no longer emits a static fallback next to every var(), which is dead weight for the browsers this build targets

## 2.2.1
    chore: build target raised from es2018 to es2022, matching the browsers that ship a native <dialog>
    chore: replaced the deprecated jQuery `.click()` shorthand with `.on('click')`/`.trigger('click')`, so the library is clean under jQuery 4
    chore: npm audit fix for brace-expansion, nanoid, postcss and undici (transitive dev dependencies)

## 2.2.0
    fix: the dialog no longer blinks out and back in before its exit animation; the closing state is now set before the native close, which fires its event asynchronously
    feat: optional custom-elements bundle so Safari/WebKit can use <dialog is="bahamut-dialogify">
    feat: enter and exit animations for drawers, toasts and popovers, skipped under prefers-reduced-motion
    feat: an anchored popover is dismissed by any click outside it; clicking its anchor toggles it shut
    feat: Dialogify.TOAST_TOP_LEFT and the five other toast position constants
    fix: the blurry-render ResizeObserver pinned drawers off screen by writing the mid-animation transform back as an inline style
    fix: a click on the dialog's own empty area no longer closes it; only clicks outside its box count as backdrop clicks
    fix: toasts and popovers no longer inherit the 40px content floor and scroll bars
    fix: a closing toast collapses its slot so the stack below it does not jump on removal
    feat(a11y): aria-labelledby from title(), focusable and labelled close button
    feat(a11y): role=status on loading and toasts, aria-busy on loading buttons, reduced-motion support
    feat: show()/showModal() return a promise resolving with the dialog returnValue
    feat: cancelable beforeclose event covering every close path (button, ESC, backdrop, form submit, close())
    feat: setContent()/getContent()/load() to update a dialog after it is created
    feat: setLoading()/isLoading() overlay and per-button loading state via updateButton()
    feat: validate()/formData()/formValues() on top of the existing <form method="dialog">
    feat: addButton()/updateButton()/removeButton()/getButton(); declarative buttons join the button list
    feat: drawer mode via the position option and attribute (left/right/top/bottom)
    feat: Dialogify.toast() auto-dismissing notifications with stacking and types
    feat: showAt() anchored popover positioning with viewport flipping and follow-on-scroll
    feat: off() to unbind instance events, and onbeforeclose on the custom element
    feat: anchor/placement/align/offset and loading-text attributes on the custom element

## 2.1.0
    feat: declarative `<dialog is="bahamut-dialogify">` customized built-in element
    feat: dialogify API (show/showModal/isOpen/setTitle/buttons/on) on the element itself
    feat: options as attributes (dialog-title, size, closable, src, options='{...}', ...)
    feat: declarative buttons via `<button ok>` / `cancel` / `close` / `primary` / `danger`
    feat: events via addEventListener, on* properties, or `onshow="handlerName"` markup
    feat: Dialogify.handlers registry for named declarative handlers
    feat: Dialogify.adopt() to wrap an existing <dialog> element
    feat: autoRemove option (defaults to false for declarative dialogs, so they are reusable)
    refactor: split core into src/js/core.js, element into src/js/element.js

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
