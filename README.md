# Dialogify

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/OneupNetwork/dialogify/ci.yml?branch=master)](https://github.com/OneupNetwork/dialogify/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/%40oneup_network%2Fdialogify)](https://www.npmjs.com/package/@oneup_network/dialogify)
[![GitHub License](https://img.shields.io/github/license/OneupNetwork/dialogify)](LICENSE)

A dialog plugin built on the native `<dialog>` element.

[中文](README.zh-TW.md)

The browser does the heavy lifting — the top layer, the backdrop, focus trapping
and <kbd>Esc</kbd> to close all come from `<dialog>` itself. Dialogify adds the
chrome around it: a title bar, a button row, ajax content, forms, drawers,
toasts and anchored popovers.

**[Documentation and live examples →](https://oneupnetwork.github.io/dialogify/)**

![basic dialogify](docs/img/screenshot1.png)

## Installation

```bash
npm install @oneup_network/dialogify jquery
```

jQuery is a **peer dependency**, so install it alongside dialogify.

### Browser

```html
<script src="path/to/jquery.min.js"></script>
<script src="path/to/dialogify.min.js"></script>
```

The browser build reads jQuery from the global scope.

### Module (ESM / CommonJS)

```javascript
import Dialogify from '@oneup_network/dialogify';
```

### Styles

Every build carries its own CSS, so no extra stylesheet is required. To style
the dialog yourself, link the standalone `@oneup_network/dialogify/css` with
`id="dialogifyCss"` before dialogify loads and the injection is skipped.

## Basic usage

Build a dialog by chaining, then open it. `show()` and `showModal()` return a
promise that resolves with the dialog's `returnValue` once it closes.

```javascript
new Dialogify('dialog content')
    .title('dialog title')
    .buttons([{ type: Dialogify.BUTTON_PRIMARY }])
    .showModal();
```

`alert`, `confirm` and `prompt` have one-line replacements:

```javascript
await Dialogify.alert('Alert!!');

if (await Dialogify.confirm('Yes or no?')) {
    // ...
}

const answer = await Dialogify.prompt('Question?');
```

A dialog can also be written straight into the page as a
[customized built-in element](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements#customized_built-in_elements),
with options as attributes and the whole API on the element itself:

```html
<dialog is="bahamut-dialogify" dialog-title="Hello">
    dialog content <b>bold text</b>
    <button ok></button>
    <button cancel></button>
</dialog>
```

```javascript
document.querySelector('dialog[is="bahamut-dialogify"]').showModal();
```

## Documentation

Everything else lives on the documentation site, with a runnable example next to
each feature:

| Topic                                                                        | What you will find                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Getting started](https://oneupnetwork.github.io/dialogify/#getting-started) | Installing and opening a first dialog                          |
| [Core concepts](https://oneupnetwork.github.io/dialogify/#concepts)          | Modal vs non-modal, chaining, promises, lifecycle              |
| [Creating a dialog](https://oneupnetwork.github.io/dialogify/#create)        | Every constructor option                                       |
| [Content](https://oneupnetwork.github.io/dialogify/#content-api)             | Titles, HTML content, ajax loading, loading state              |
| [Forms](https://oneupnetwork.github.io/dialogify/#forms)                     | Validation and reading values back                             |
| [Buttons](https://oneupnetwork.github.io/dialogify/#buttons)                 | Defining them and driving them at runtime                      |
| [Events](https://oneupnetwork.github.io/dialogify/#events)                   | `show`, `close`, `cancel` and intercepting a close             |
| [Drawer, toast, popover](https://oneupnetwork.github.io/dialogify/#variants) | Edge drawers, notifications and anchored popovers              |
| [Shortcuts](https://oneupnetwork.github.io/dialogify/#shortcuts)             | `alert`, `confirm`, `prompt`, `toast`                          |
| [Declarative usage](https://oneupnetwork.github.io/dialogify/#declarative)   | `<dialog is="bahamut-dialogify">`, attributes, buttons, events |
| [Theming](https://oneupnetwork.github.io/dialogify/#theming)                 | Custom properties, dark theme, `z-index`                       |
| [Locale](https://oneupnetwork.github.io/dialogify/#locale)                   | Built-in languages and adding your own                         |
| [API reference](https://oneupnetwork.github.io/dialogify/#api)               | Every method, option and constant                              |

Content is inserted as **HTML**, which makes rich layouts easy but means any
user-supplied value has to be escaped before it goes in.

## Browser support

Any browser with a native `<dialog>` element: Chrome 94+, Firefox 98+ and
Safari 15.4+. The bundles target `es2022`.

Two optional bundles cover the gaps, and both must be loaded **before**
dialogify:

```html
<!-- <dialog> for older browsers -->
<script src="path/to/dialog-polyfill.min.js"></script>
<!-- customized built-in elements, i.e. `is="..."`, for Safari -->
<script src="path/to/custom-elements.min.js"></script>
<script src="path/to/dialogify.min.js"></script>
```

## Dependencies

- [jQuery](https://jquery.com/) — peer dependency, `>=3.0.0` (jQuery 4 included)

## Designed by

[Phoebe](https://github.com/Phoebe1226)

## Contributing

```bash
npm install
npm run build
npm test
```

Fork the repo, branch off master, and open a pull request. Contributions are
welcome.

